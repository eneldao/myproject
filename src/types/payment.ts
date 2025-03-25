export interface CCPAccount {
  ccp_number: string;
  ccp_key: string;
  holder_name: string;
  wilaya: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  ccp_number: string;
  ccp_key: string;
  amount: number;
  plan: string;
  billing_period: 'month' | 'year';
  status: 'pending' | 'verified' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface UserPaymentInfo {
  user_id: string;
  ccp_number: string;
  ccp_key: string;
  holder_name: string;
  wilaya: string;
  verified: boolean;
}

export interface PaymentData {
  merchant_account: CCPAccount;
  transactions: Transaction[];
  users_payment_info: UserPaymentInfo[];
} 