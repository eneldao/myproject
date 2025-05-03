const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyUser() {
  try {
    // Check auth.users table
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('email', 'admin@trans-easy.com');

    if (usersError) {
      console.error('Error checking users:', usersError);
      return;
    }

    console.log('Users found:', users);

    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin@trans-easy.com');

    if (profilesError) {
      console.error('Error checking profiles:', profilesError);
      return;
    }

    console.log('Profiles found:', profiles);

    // Try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@trans-easy.com',
      password: 'Admin@123'
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
    } else {
      console.log('Sign in successful:', signInData);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

verifyUser(); 