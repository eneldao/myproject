import { Transaction, UserPaymentInfo } from '@/types/payment';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClientComponentClient();

export async function createTransaction(
  userPaymentInfo: UserPaymentInfo,
  amount: number,
  plan: string,
  billingPeriod: 'month' | 'year'
): Promise<Transaction> {
  const transaction: Transaction = {
    id: `tr_${uuidv4()}`,
    user_id: userPaymentInfo.user_id,
    ccp_number: userPaymentInfo.ccp_number,
    ccp_key: userPaymentInfo.ccp_key,
    amount,
    plan,
    billing_period: billingPeriod,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Store transaction in Supabase
  const { error } = await supabase
    .from('transactions')
    .insert(transaction);

  if (error) {
    throw new Error('Failed to create transaction');
  }

  return transaction;
}

export async function verifyTransaction(transactionId: string): Promise<Transaction> {
  // Update transaction status to verified
  const { data, error } = await supabase
    .from('transactions')
    .update({ 
      status: 'verified',
      updated_at: new Date().toISOString()
    })
    .eq('id', transactionId)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to verify transaction');
  }

  return data;
}

export async function completeTransaction(transactionId: string): Promise<Transaction> {
  // Update transaction status to completed
  const { data, error } = await supabase
    .from('transactions')
    .update({ 
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', transactionId)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to complete transaction');
  }

  return data;
}

export async function saveUserPaymentInfo(
  userId: string,
  ccpNumber: string,
  ccpKey: string,
  holderName: string,
  wilaya: string
): Promise<UserPaymentInfo> {
  const paymentInfo: UserPaymentInfo = {
    user_id: userId,
    ccp_number: ccpNumber,
    ccp_key: ccpKey,
    holder_name: holderName,
    wilaya,
    verified: false,
  };

  // Store payment info in Supabase
  const { error } = await supabase
    .from('users_payment_info')
    .insert(paymentInfo);

  if (error) {
    throw new Error('Failed to save payment information');
  }

  return paymentInfo;
}

export async function validateCCPNumber(ccpNumber: string): Promise<boolean> {
  // Basic CCP number validation for Algeria (typically 10 digits)
  return /^\d{10}$/.test(ccpNumber.replace(/\s/g, ''));
}

export async function validateCCPKey(ccpKey: string): Promise<boolean> {
  // Basic CCP key validation for Algeria (typically 2 digits)
  return /^\d{2}$/.test(ccpKey.replace(/\s/g, ''));
}

export function formatCCPNumber(ccpNumber: string): string {
  // Format CCP number with spaces (e.g., 0012345678 -> 001 234 5678)
  return ccpNumber.replace(/\s/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
} 