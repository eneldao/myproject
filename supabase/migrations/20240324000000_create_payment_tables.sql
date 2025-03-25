-- Create users_payment_info table
CREATE TABLE users_payment_info (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ccp_number VARCHAR(10) NOT NULL,
  ccp_key VARCHAR(2) NOT NULL,
  holder_name VARCHAR(255) NOT NULL,
  wilaya VARCHAR(100) NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id)
);

-- Create transactions table
CREATE TABLE transactions (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ccp_number VARCHAR(10) NOT NULL,
  ccp_key VARCHAR(2) NOT NULL,
  amount INTEGER NOT NULL,
  plan VARCHAR(50) NOT NULL,
  billing_period VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies
ALTER TABLE users_payment_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own payment info
CREATE POLICY "Users can view own payment info"
  ON users_payment_info
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own payment info
CREATE POLICY "Users can insert own payment info"
  ON users_payment_info
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own payment info
CREATE POLICY "Users can update own payment info"
  ON users_payment_info
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own transactions
CREATE POLICY "Users can create transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only authenticated users can view their transactions
CREATE POLICY "Authenticated users can view own transactions"
  ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_payment_info_updated_at
  BEFORE UPDATE ON users_payment_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 