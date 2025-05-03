-- Create payment_transactions table to track financial transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_project_id ON payment_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_client_id ON payment_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_freelancer_id ON payment_transactions(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Add RLS policies
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users who are either the client or freelancer
CREATE POLICY payment_transactions_read_policy
  ON payment_transactions
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM clients WHERE id = client_id
      UNION
      SELECT user_id FROM freelancers WHERE id = freelancer_id
    )
  );

-- Only backend service can insert records (via supabaseAdmin)
CREATE POLICY payment_transactions_insert_policy
  ON payment_transactions
  FOR INSERT
  WITH CHECK (false); -- Default to deny insert, we'll use service role key instead
