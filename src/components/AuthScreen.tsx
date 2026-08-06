import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, ShieldCheck } from 'lucide-react';

interface AuthScreenProps {
  onLogin: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#06090e] p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 transition-all">
        
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="bg-emerald-500 p-2.5 rounded-xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
            Probashi <span className="text-emerald-500">Trading</span>
          </span>
        </div>

        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2 font-sans tracking-tight">
          {isSignUp ? 'Create Elite Account' : 'Welcome Back'}
        </h2>
        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8 font-sans">
          Secure, institutional-grade market access
        </p>

        <button 
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-3.5 px-4 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-6 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Or continue with</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="email" 
                required
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Email address"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="password" 
                required
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Password"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-sans">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-emerald-500 font-semibold hover:text-emerald-400 transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-mono">
        <ShieldCheck className="w-4 h-4" />
        <span>End-to-End Encrypted Financial Gateway</span>
      </div>
    </div>
  );
};
