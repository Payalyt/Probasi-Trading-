import { db } from './src/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const syncUsers = async () => {
  try {
    const data = JSON.parse(fs.readFileSync('users.json', 'utf-8'));
    let count = 0;
    
    for (const user of data) {
      await setDoc(doc(db, 'users', user.id), {
        uid: user.id,
        name: user.name || '',
        email: user.email,
        role: user.role || 'user',
        balance: user.actual_balance || 0,
        demo_balance: user.demo_balance || 10000,
        trading_mode: user.trading_mode || 'normal',
        wallet_address: user.wallet_address || '',
        status: user.status || 'active'
      }, { merge: true });
      console.log(`Synced user: ${user.email}`);
      count++;
    }
    
    console.log(`Successfully synced ${count} users to Firestore!`);
    process.exit(0);
  } catch (error) {
    console.error('Error syncing users:', error);
    process.exit(1);
  }
};

syncUsers();
