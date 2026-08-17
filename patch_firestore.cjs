const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf-8');

// Replace saveUsers
code = code.replace(/function saveUsers\(\) \{[\s\S]*?\n\}/, `function saveUsers() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
    users.forEach(u => db.collection('users').doc(u.id).set(u).catch(()=>{}));
  } catch (e) {
    console.error("Error saving users", e);
  }
}`);

// Replace saveSettings
code = code.replace(/function saveSettings\(\) \{[\s\S]*?\n\}/, `function saveSettings() {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(platformSettings, null, 2));
    db.collection('settings').doc('platform').set(platformSettings).catch(()=>{});
  } catch (e) {
    console.error("Error saving settings", e);
  }
}`);

// Replace saveGateways
code = code.replace(/function saveGateways\(\) \{[\s\S]*?\n\}/, `function saveGateways() {
  try {
    fs.writeFileSync(GATEWAYS_FILE, JSON.stringify(gatewaySettings, null, 2));
    db.collection('gateways').doc('builtin').set(gatewaySettings).catch(()=>{});
  } catch (e) {
    console.error("Error saving gateways", e);
  }
}`);

// Replace saveCustomGateways
code = code.replace(/function saveCustomGateways\(\) \{[\s\S]*?\n\}/, `function saveCustomGateways() {
  try {
    fs.writeFileSync(CUSTOM_GATEWAYS_FILE, JSON.stringify(customGateways, null, 2));
    db.collection('gateways').doc('custom').set({ list: customGateways }).catch(()=>{});
  } catch (e) {
    console.error("Error saving custom gateways", e);
  }
}`);

// Replace saveDeposits
code = code.replace(/function saveDeposits\(\) \{[\s\S]*?\n\}/, `function saveDeposits() {
  try {
    fs.writeFileSync(DEPOSITS_FILE, JSON.stringify(deposits, null, 2));
    deposits.forEach(d => db.collection('deposits').doc(d.id).set(d).catch(()=>{}));
  } catch (e) {
    console.error("Error saving deposits", e);
  }
}`);

// Replace saveWithdrawals
code = code.replace(/function saveWithdrawals\(\) \{[\s\S]*?\n\}/, `function saveWithdrawals() {
  try {
    fs.writeFileSync(WITHDRAWALS_FILE, JSON.stringify(withdrawals, null, 2));
    withdrawals.forEach(w => db.collection('withdrawals').doc(w.id).set(w).catch(()=>{}));
  } catch (e) {
    console.error("Error saving withdrawals", e);
  }
}`);

// Add loadFromFirestore to startServer
code = code.replace(/async function startServer\(\) \{/, `async function loadFromFirestore() {
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
  await loadFromFirestore();`);

// Find trades.unshift(newTrade) and add db.collection('trades').doc(newTrade.id).set(newTrade);
code = code.replace(/trades\.unshift\(newTrade\);/, `trades.unshift(newTrade);\n    db.collection('trades').doc(newTrade.id).set(newTrade).catch(()=>{});`);

// In the setInterval for trades, add db update for resolved trades
code = code.replace(/trade\.profit = -trade\.investment_amount;\n        \}/, `trade.profit = -trade.investment_amount;\n        }\n        db.collection('trades').doc(trade.id).set(trade).catch(()=>{});`);

fs.writeFileSync('server.ts', code);
