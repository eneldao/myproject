import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAdminUser() {
  try {
    // Check auth user
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const adminUser = authData.users.find(user => user.email === 'admin@trans-easy.com');
    if (!adminUser) {
      console.log('Admin user not found in auth');
      return;
    }

    console.log('Admin user found in auth:', adminUser.id);

    // Check profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', adminUser.id)
      .single();

    if (profileError) throw profileError;

    console.log('Admin profile found:', profile);

    if (profile.user_type !== 'admin') {
      console.log('User is not an admin. Updating profile...');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ user_type: 'admin' })
        .eq('id', adminUser.id);

      if (updateError) throw updateError;
      console.log('Profile updated to admin');
    }
  } catch (error) {
    console.error('Error verifying admin user:', error);
  }
}

verifyAdminUser(); 