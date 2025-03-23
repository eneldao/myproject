const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    // Create new admin user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin2@trans-easy.com',
      password: 'Admin@123',
      options: {
        data: {
          full_name: 'Admin User',
          user_type: 'admin'
        }
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      throw authError;
    }

    console.log('Admin user created:', authData.user.id);

    // Create the admin profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email: 'admin2@trans-easy.com',
          full_name: 'Admin User',
          user_type: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

    if (profileError) {
      console.error('Error creating profile:', profileError);
      throw profileError;
    }

    console.log('Admin profile created successfully');
    console.log('Admin credentials:');
    console.log('Email: admin2@trans-easy.com');
    console.log('Password: Admin@123');

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser(); 