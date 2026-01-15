export interface BuyIn {
  id: string;
  amount: number;
  isPaid: boolean;
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  buyIns: BuyIn[];
  cashOut: number | null;
  isBank: boolean;
}

export interface BankPaymentInfo {
  venmo: string;
  zelle: string;
}

export interface Game {
  id: string;
  createdAt: number;
  players: Player[];
  bankPaymentInfo: BankPaymentInfo;
  isSettled: boolean;
}

export interface Settlement {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export type GameView = 'setup' | 'active' | 'ledger';
