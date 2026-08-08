import React, { useEffect } from 'react';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  useEffect(() => {
    const demoUser: User = {
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
    };
    onLogin(demoUser);
  }, [onLogin]);

  return <div className="min-h-screen bg-[#060709] flex flex-col items-center justify-center p-4 text-white">Initializing...</div>;
};
