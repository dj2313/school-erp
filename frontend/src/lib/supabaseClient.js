/**
 * Supabase Client Initialization
 * Initializes Supabase client with proper configuration
 */

import { createClient } from '@supabase/supabase-js';

// ✅ 1. Environment Variables Validation
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that required env vars are present
if (!SUPABASE_URL) {
  console.error('❌ VITE_SUPABASE_URL is not defined in .env file');
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not defined in .env file');
}

// ✅ 2. Verify URL format
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

if (SUPABASE_URL && !isValidUrl(SUPABASE_URL)) {
  console.error('❌ VITE_SUPABASE_URL has invalid format:', SUPABASE_URL);
}

// ✅ 3. Verify URL matches expected Supabase domain
if (SUPABASE_URL && !SUPABASE_URL.includes('.supabase.co')) {
  console.warn('⚠️ VITE_SUPABASE_URL does not contain supabase.co domain. Expected format: https://xxxxx.supabase.co');
}

// ✅ 4. Check for whitespace issues (common typo)
if (SUPABASE_URL && SUPABASE_URL.trim() !== SUPABASE_URL) {
  console.error('❌ VITE_SUPABASE_URL contains leading/trailing whitespace');
}

if (SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.trim() !== SUPABASE_ANON_KEY) {
  console.error('❌ VITE_SUPABASE_ANON_KEY contains leading/trailing whitespace');
}

// ✅ 5. Verify JWT token format
const isValidJWT = (token) => {
  const parts = token.split('.');
  return parts.length === 3;
};

if (SUPABASE_ANON_KEY && !isValidJWT(SUPABASE_ANON_KEY)) {
  console.error('❌ VITE_SUPABASE_ANON_KEY does not appear to be a valid JWT token');
}

// ✅ 6. Initialize Supabase Client (only if both env vars are present)
let supabase = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
    
    // ✅ 7. Log initialization status
    console.log('✅ Supabase client initialized successfully');
    console.log(`   Project: ${SUPABASE_URL.split('.')[0].replace('https://', '')}`);
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error.message);
    supabase = null;
  }
} else {
  console.warn('⚠️ Supabase is currently disabled - environment variables not set. Using Express backend for authentication.');
}

export default supabase;
