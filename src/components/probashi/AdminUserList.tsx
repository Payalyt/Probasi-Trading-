import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  role: string;
  balance: number;
  trading_mode: string;
}

export const AdminUserList: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const syncLegacyUsers = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/users');
      const legacyUsers = await res.json();
      
      let count = 0;
      for (const u of legacyUsers) {
        // Skip syncing if we already have them in firestore
        if (!users.find(fsUser => fsUser.email === u.email)) {
          const { doc, setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, 'users', u.id), {
            uid: u.id,
            name: u.name || '',
            email: u.email,
            role: u.role || 'user',
            balance: u.actual_balance || 0,
            demo_balance: u.demo_balance || 10000,
            trading_mode: u.trading_mode || 'normal',
            wallet_address: u.wallet_address || '',
            status: u.status || 'active'
          }, { merge: true });
          count++;
        }
      }
      alert(`Successfully imported ${count} missing users to Firebase!`);
    } catch (e: any) {
      alert(`Error syncing: ${e.message}`);
    }
    setSyncing(false);
  };

  useEffect(() => {
    // Reference to the 'users' collection
    const usersRef = collection(db, 'users');
    
    // Create a query to optionally order users by creation date
    const q = query(usersRef, orderBy('createdAt', 'desc'));

    // Set up real-time listener using onSnapshot
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedUsers: UserData[] = [];
        snapshot.forEach((doc) => {
          fetchedUsers.push({ uid: doc.id, ...doc.data() } as UserData);
        });
        setUsers(fetchedUsers);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching users:', err);
        setError('Failed to load user list.');
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading user data in real-time...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Real-time Registered Users</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={syncLegacyUsers}
            disabled={syncing}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync Missing Users from API'}
          </button>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
            {users.length} Total
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Trading Mode</th>
              <th className="px-6 py-3 font-medium">Live Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                  {user.email || 'No email provided'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.trading_mode === 'always_win' ? 'bg-green-100 text-green-700' :
                    user.trading_mode === 'always_loss' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {user.trading_mode || 'Normal'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-semibold">
                  ${user.balance?.toFixed(2) || '0.00'}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No users found in Firestore.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
