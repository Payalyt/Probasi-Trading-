export interface User {
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
}

export type TradeType = 'Buy' | 'Sell';
export type TradeStatus = 'Pending' | 'Win' | 'Loss' | 'Draw';
export type OutcomeControl = 'Auto' | 'Force_Win' | 'Force_Loss';

export interface Trade {
  id: string;
  user_id: string;
  user_name?: string;
  asset_name: string;
  trade_type: TradeType;
  investment_amount: number;
  payout_percentage: number;
  entry_price: number;
  exit_price?: number;
  duration: number; // in seconds
  created_at: number; // timestamp ms
  expires_at: number; // timestamp ms
  trade_status: TradeStatus;
  outcome_control: OutcomeControl;
  account_type: 'live' | 'demo';
  profit?: number;
}

export type DepositMethod = 'Bkash' | 'Nagad' | 'Crypto' | 'Bank Transfer';
export type DepositStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Deposit {
  id: string;
  user_id: string;
  user_name?: string;
  method: DepositMethod;
  amount: number;
  transaction_id: string;
  created_at: number;
  status: DepositStatus;
}

export type WithdrawalStatus = 'Pending' | 'Frozen' | 'Audited' | 'Rejected';

export interface Withdrawal {
  id: string;
  user_id: string;
  user_name?: string;
  method: DepositMethod;
  account_number: string;
  amount: number;
  created_at: number;
  status: WithdrawalStatus;
  notice?: string;
}

export interface AssetInfo {
  symbol: string;
  name: string;
  tvSymbol: string;
  currentPrice: number;
  payoutRate: number;
  category: 'Crypto' | 'Forex' | 'Stocks' | 'Commodities';
}
