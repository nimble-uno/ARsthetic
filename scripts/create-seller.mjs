import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSeller(email, password) {
  try {
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    console.log('Seller account created successfully!');
    console.log('Email:', email);
    console.log('User ID:', data.user.id);
    
    // Insert into sellers table
    const { error: insertError } = await supabase
      .from('sellers')
      .insert([{ id: data.user.id, email }]);

    if (insertError) throw insertError;

    console.log('Seller record created in database');
  } catch (error) {
    console.error('Error creating seller account:', error.message);
  } finally {
    process.exit(0);
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node create-seller.mjs <email> <password>');
  process.exit(1);
}

createSeller(email, password);