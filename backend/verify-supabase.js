#!/usr/bin/env node
/**
 * Backend Supabase Connection Verification Script
 * 
 * Run this script to verify your Supabase database connection from the backend
 * 
 * Usage:
 *   npm run verify-supabase
 *   or
 *   node verify-supabase.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '═'.repeat(60));
  log(title, 'cyan');
  console.log('═'.repeat(60));
}

async function verifyEnvironment() {
  section('1️⃣  ENVIRONMENT VARIABLES CHECK');

  const checks = {
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_PROJECT_URL: process.env.SUPABASE_PROJECT_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  };

  let allSet = true;

  Object.entries(checks).forEach(([key, value]) => {
    if (value) {
      const display = key === 'SUPABASE_ANON_KEY' 
        ? `${value.substring(0, 30)}...`
        : value;
      log(`✅ ${key}: ${display}`, 'green');
    } else {
      log(`❌ ${key}: NOT SET`, 'red');
      allSet = false;
    }
  });

  return allSet;
}

async function verifyDatabaseConnection() {
  section('2️⃣  DATABASE CONNECTION CHECK');

  try {
    log('Attempting to connect to database...', 'blue');
    
    // Try to execute a simple query
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    
    if (result && result[0]) {
      log(`✅ Connected successfully`, 'green');
      log(`   Server time: ${result[0].current_time}`, 'green');
      return true;
    }
  } catch (error) {
    log(`❌ Connection failed`, 'red');
    log(`   Error: ${error.message}`, 'red');
    
    // Provide helpful suggestions
    if (error.message.includes('connect')) {
      log('\n💡 Connection error. Check:', 'yellow');
      log('   1. Database URL is correct', 'yellow');
      log('   2. Supabase project is active', 'yellow');
      log('   3. Network connection is working', 'yellow');
    }
    
    if (error.message.includes('permission') || error.message.includes('role')) {
      log('\n💡 Permission error. Check:', 'yellow');
      log('   1. Database credentials are correct', 'yellow');
      log('   2. User has necessary privileges', 'yellow');
    }
    
    return false;
  }
}

async function verifyDatabaseStructure() {
  section('3️⃣  DATABASE STRUCTURE CHECK');

  try {
    // Check if we can query information_schema
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      LIMIT 5
    `;

    if (tables && tables.length > 0) {
      log(`✅ Found ${tables.length} tables in public schema:`, 'green');
      tables.forEach(t => {
        log(`   • ${t.table_name}`, 'green');
      });
    } else {
      log(`⚠️  No tables found in public schema (might be empty)`, 'yellow');
    }
    return true;
  } catch (error) {
    log(`❌ Cannot query database structure`, 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function verifySupabaseMetadata() {
  section('4️⃣  SUPABASE CONFIGURATION CHECK');

  const url = process.env.SUPABASE_PROJECT_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url) {
    log('❌ SUPABASE_PROJECT_URL not set', 'red');
    return false;
  }

  // Extract project ID from URL
  const projectId = url.split('.')[0].replace('https://', '');
  
  log(`✅ Project ID: ${projectId}`, 'green');
  log(`✅ Project URL: ${url}`, 'green');

  if (key) {
    // Verify JWT structure
    const parts = key.split('.');
    if (parts.length === 3) {
      log(`✅ ANON_KEY is valid JWT (3 parts)`, 'green');
      
      try {
        // Decode header (part 1)
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        log(`   Algorithm: ${header.alg}`, 'green');
        
        // Decode payload (part 2)
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        log(`   Role: ${payload.role}`, 'green');
        log(`   Issued At: ${new Date(payload.iat * 1000).toISOString()}`, 'green');
        log(`   Expires: ${new Date(payload.exp * 1000).toISOString()}`, 'green');
        
        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
          log(`   ⚠️  Token is EXPIRED!`, 'yellow');
          return false;
        }
        
      } catch (e) {
        log(`   ⚠️  Could not decode JWT: ${e.message}`, 'yellow');
      }
    } else {
      log(`❌ ANON_KEY is not valid JWT (expected 3 parts)`, 'red');
      return false;
    }
  }

  return true;
}

async function testNetworkConnectivity() {
  section('5️⃣  NETWORK CONNECTIVITY CHECK');

  const url = process.env.SUPABASE_PROJECT_URL;
  
  if (!url) {
    log('⚠️  Cannot test network - SUPABASE_PROJECT_URL not set', 'yellow');
    return false;
  }

  try {
    log(`Checking connectivity to ${url}...`, 'blue');
    
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
      },
    });

    if (response.ok) {
      log(`✅ Network connectivity OK (HTTP ${response.status})`, 'green');
      return true;
    } else if (response.status === 401 || response.status === 403) {
      log(`✅ Reached Supabase (HTTP ${response.status} - authentication issue, expected)`, 'green');
      return true;
    } else {
      log(`⚠️  Unexpected response (HTTP ${response.status})`, 'yellow');
      log(`   Status: ${response.statusText}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Network error: ${error.message}`, 'red');
    log('\n💡 Possible causes:', 'yellow');
    log('   1. Internet connection down', 'yellow');
    log('   2. Firewall blocking supabase.co domain', 'yellow');
    log('   3. Invalid project URL', 'yellow');
    return false;
  }
}

async function verifyPrismaConnection() {
  section('6️⃣  PRISMA ORM CHECK');

  try {
    log('Testing Prisma connection...', 'blue');
    
    await prisma.$connect();
    log('✅ Prisma connection successful', 'green');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as health_check`;
    log('✅ Prisma query execution successful', 'green');
    
    return true;
  } catch (error) {
    log(`❌ Prisma error: ${error.message}`, 'red');
    return false;
  }
}

async function printSummary(results) {
  section('📊 VERIFICATION SUMMARY');

  const allPassed = Object.values(results).every(r => r === true);
  
  Object.entries(results).forEach(([check, passed]) => {
    const status = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`${status} ${check}`, color);
  });

  console.log('\n' + '═'.repeat(60));
  
  if (allPassed) {
    log('🎉 ALL CHECKS PASSED - Supabase connection is working!', 'green');
  } else {
    const failedChecks = Object.entries(results)
      .filter(([_, passed]) => !passed)
      .map(([check]) => check);
    
    log(`⚠️  ${failedChecks.length} check(s) failed:`, 'yellow');
    failedChecks.forEach(check => {
      log(`   • ${check}`, 'yellow');
    });
  }
  
  console.log('═'.repeat(60) + '\n');
  
  return allPassed;
}

async function main() {
  console.clear();
  log('🔍 SUPABASE BACKEND VERIFICATION', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Started at: ${new Date().toISOString()}`, 'blue');

  const results = {
    'Environment Variables': await verifyEnvironment(),
    'Database Connection': await verifyDatabaseConnection(),
    'Database Structure': await verifyDatabaseStructure(),
    'Supabase Configuration': await verifySupabaseMetadata(),
    'Network Connectivity': await testNetworkConnectivity(),
    'Prisma ORM': await verifyPrismaConnection(),
  };

  const allPassed = await printSummary(results);

  // Cleanup
  await prisma.$disconnect();

  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Run the verification
main().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
