import React from 'react';
import { Zap, Box, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

export const BoostPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full text-slate-900 dark:text-white transition-colors">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <Zap className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-black font-heading mb-2">Boost & Cubes</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Upgrade your trading experience. Purchase cubes to unlock higher payout rates, faster withdrawals, and premium indicators.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Basic Cube */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative flex flex-col hover:border-emerald-500/50 transition-colors shadow-sm">
          <div className="mb-4">
            <Box className="w-10 h-10 text-blue-500 mb-2" />
            <h3 className="text-xl font-bold font-heading">Starter Cube</h3>
            <div className="text-2xl font-black mt-2">$50</div>
          </div>
          <ul className="space-y-3 mb-6 flex-1 text-sm font-medium text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-500" /> +5% Payout Boost</li>
            <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-500" /> Priority Support</li>
          </ul>
          <button className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 rounded-xl transition-colors">
            Purchase
          </button>
        </div>

        {/* Pro Cube */}
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl p-6 relative flex flex-col shadow-lg shadow-emerald-500/10 transform md:-translate-y-2">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Most Popular
          </div>
          <div className="mb-4">
            <Box className="w-10 h-10 text-emerald-500 mb-2" />
            <h3 className="text-xl font-bold font-heading text-emerald-600 dark:text-emerald-400">Pro Cube</h3>
            <div className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">$150</div>
          </div>
          <ul className="space-y-3 mb-6 flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            <li className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /> +10% Payout Boost</li>
            <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500" /> Fast Withdrawals</li>
            <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500" /> Pro Trading Signals</li>
          </ul>
          <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl transition-colors shadow-sm">
            Purchase
          </button>
        </div>

        {/* Elite Cube */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative flex flex-col hover:border-amber-500/50 transition-colors shadow-sm">
          <div className="mb-4">
            <Box className="w-10 h-10 text-amber-500 mb-2" />
            <h3 className="text-xl font-bold font-heading">Elite Cube</h3>
            <div className="text-2xl font-black mt-2">$500</div>
          </div>
          <ul className="space-y-3 mb-6 flex-1 text-sm font-medium text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> +20% Payout Boost</li>
            <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> Instant Withdrawals</li>
            <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> Personal Account Manager</li>
            <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> VIP Events</li>
          </ul>
          <button className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 rounded-xl transition-colors">
            Purchase
          </button>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-sm text-blue-700 dark:text-blue-300">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p>Boosters apply to all assets automatically. Payout boosts are added directly to the base asset percentage up to a maximum of 99%.</p>
      </div>
    </div>
  );
};
