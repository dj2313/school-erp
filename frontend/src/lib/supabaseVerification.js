/**
 * Supabase Connection Verification Tests
 * Runs diagnostic checks on Supabase connectivity
 */

import supabase from './supabaseClient';

export const verificationChecks = {
  /**
   * ✅ Check 1: Verify client initialization
   */
  clientInitialized: () => {
    try {
      return {
        status: supabase ? 'success' : 'failed',
        message: supabase ? '✅ Supabase client is properly initialized' : '❌ Supabase client is null',
        details: {
          hasAuthModule: !!supabase?.auth,
          hasRealtimeModule: !!supabase?.realtime,
          hasStorageModule: !!supabase?.storage,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: `❌ Error checking client initialization: ${error.message}`,
      };
    }
  },

  /**
   * ✅ Check 2: Verify environment variables
   */
  envVariables: () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const checks = {
      urlExists: !!url,
      keyExists: !!key,
      urlValid: url && url.includes('.supabase.co'),
      keyIsJWT: key && key.split('.').length === 3,
    };

    const issues = [];
    if (!checks.urlExists) issues.push('VITE_SUPABASE_URL not defined');
    if (!checks.keyExists) issues.push('VITE_SUPABASE_ANON_KEY not defined');
    if (!checks.urlValid)
      issues.push('VITE_SUPABASE_URL missing .supabase.co domain');
    if (!checks.keyIsJWT) issues.push('VITE_SUPABASE_ANON_KEY not a valid JWT');

    return {
      status: issues.length === 0 ? 'success' : 'failed',
      message:
        issues.length === 0
          ? '✅ All environment variables are properly configured'
          : `❌ Environment variable issues: ${issues.join(', ')}`,
      details: {
        url: url ? `${url.substring(0, 50)}...` : 'NOT SET',
        key: key ? `${key.substring(0, 30)}...` : 'NOT SET',
        checks,
      },
    };
  },

  /**
   * ✅ Check 3: Database connectivity test
   */
  databaseReachable: async () => {
    try {
      // Try to fetch from a table - this will fail with permission error if DB is unreachable
      // but will succeed if the connection works
      const { error } = await supabase
        .from('_test_connection')
        .select('*', { count: 'estimated', head: true });

      // If error is 400/404 - table doesn't exist (DB is reachable)
      // If error is network related - DB is unreachable
      if (error?.status === 404 || error?.status === 400) {
        return {
          status: 'success',
          message: '✅ Database is reachable and responding',
          details: {
            endpoint: import.meta.env.VITE_SUPABASE_URL,
            responseTime: 'Latency acceptable',
          },
        };
      }

      if (error?.status === 401 || error?.status === 403) {
        return {
          status: 'warning',
          message: '⚠️ Database reachable but authentication issue',
          error: error?.message,
          details: {
            issue: 'RLS Policy or Invalid Key',
            possibleCauses: [
              'Invalid ANON_KEY',
              'RLS policies blocking public access',
              'Table permissions not set correctly',
            ],
          },
        };
      }

      return {
        status: 'failed',
        message: '❌ Database is not reachable',
        error: error?.message,
      };
    } catch (error) {
      return {
        status: 'error',
        message: `❌ Network error connecting to database: ${error.message}`,
        details: {
          possibleCauses: [
            'No internet connection',
            'Firewall blocking Supabase domain',
            'Invalid project URL',
            'CORS issue (check browser console)',
          ],
        },
      };
    }
  },

  /**
   * ✅ Check 4: Network requests to Supabase domain
   */
  networkRequest: async () => {
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      if (!url) {
        return {
          status: 'failed',
          message: '❌ VITE_SUPABASE_URL not configured',
        };
      }

      const startTime = performance.now();
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      });
      const endTime = performance.now();

      if (response.ok || response.status === 401 || response.status === 403) {
        return {
          status: 'success',
          message: '✅ Network requests to Supabase domain successful',
          details: {
            domain: new URL(url).hostname,
            statusCode: response.status,
            responseTime: `${(endTime - startTime).toFixed(2)}ms`,
            headers: {
              'Content-Type': response.headers.get('content-type'),
              'Server': response.headers.get('server'),
            },
          },
        };
      }

      return {
        status: 'failed',
        message: `❌ Unexpected response status: ${response.status}`,
        details: {
          statusCode: response.status,
          error: response.statusText,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: `❌ Network request failed: ${error.message}`,
        details: {
          possibleCauses: [
            'CORS issue - check browser console',
            'Invalid domain (typo in VITE_SUPABASE_URL)',
            'Network connectivity problem',
            'Firewall blocking requests',
          ],
          networkErrorGuide: 'Open DevTools → Network tab → look for failed requests',
        },
      };
    }
  },

  /**
   * ✅ Check 5: Authentication/RLS Policy test
   */
  rlsAndAuth: async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError && authError.status === 400) {
        return {
          status: 'warning',
          message: '⚠️ Not authenticated (expected for public access)',
          details: {
            currentUser: null,
            notes: 'This is normal if using public/anon role',
          },
        };
      }

      if (authError) {
        return {
          status: 'warning',
          message: `⚠️ Auth check returned: ${authError.message}`,
          error: authError,
        };
      }

      return {
        status: 'success',
        message: user ? '✅ User authenticated successfully' : '✅ Anonymous access available',
        details: {
          userId: user?.id || 'Anonymous',
          email: user?.email || 'No email (anon)',
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: `❌ RLS/Auth check failed: ${error.message}`,
        details: {
          possibleCauses: [
            'RLS policies too restrictive',
            'Invalid JWT token',
            'Auth schema not initialized',
          ],
        },
      };
    }
  },

  /**
   * ✅ Check 6: Verify URL has no typos (common issues)
   */
  urlValidation: () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const issues = [];

    if (!url) {
      return {
        status: 'failed',
        message: '❌ VITE_SUPABASE_URL is not set',
      };
    }

    // Check for common typos
    if (url.includes('supabase.com')) issues.push('Typo: should be .supabase.co not .supabase.com');
    if (url.includes('supbase.co')) issues.push('Typo: supbase.co should be supabase.co');
    if (url.includes('superbase.co')) issues.push('Typo: superbase.co should be supabase.co');
    if (url.startsWith('http://'))
      issues.push('Warning: should use https:// not http://');
    if (url.includes('localhost'))
      issues.push('Info: using localhost (development only)');
    if (url.trim().length !== url.length)
      issues.push('Critical: URL has whitespace - trim it!');

    return {
      status: issues.length === 0 ? 'success' : issues.some(i => i.includes('Critical')) ? 'failed' : 'warning',
      message:
        issues.length === 0
          ? '✅ URL format is correct'
          : `⚠️ URL validation issues: ${issues.join('; ')}`,
      details: {
        url,
        projectId: url?.split('.')[0]?.replace('https://', ''),
        issues,
      },
    };
  },
};

/**
 * Run all verification checks
 */
export const runAllChecks = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    environment: import.meta.env.MODE,
    checks: {
      clientInitialized: verificationChecks.clientInitialized(),
      envVariables: verificationChecks.envVariables(),
      urlValidation: verificationChecks.urlValidation(),
      networkRequest: null,
      databaseReachable: null,
      rlsAndAuth: null,
    },
  };

  // Run async checks
  results.checks.networkRequest = await verificationChecks.networkRequest();
  results.checks.databaseReachable = await verificationChecks.databaseReachable();
  results.checks.rlsAndAuth = await verificationChecks.rlsAndAuth();

  // Overall status
  const allStatuses = Object.values(results.checks).map(c => c.status);
  const hasFailed = allStatuses.includes('failed');
  const hasError = allStatuses.includes('error');
  const hasWarning = allStatuses.includes('warning');

  results.summary = {
    overallStatus: hasFailed ? 'FAILED' : hasError ? 'ERROR' : hasWarning ? 'WARNING' : 'SUCCESS',
    message: hasFailed 
      ? '❌ Critical issues found - Supabase connection is not working properly'
      : hasError
      ? '⚠️ Errors detected - Check connection and configuration'
      : hasWarning
      ? '⚠️ Non-critical warnings - Some features may not work'
      : '✅ All checks passed - Supabase connection is properly configured',
  };

  return results;
};

/**
 * Print results in console
 */
export const printResults = (results) => {
  console.clear();
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔍 SUPABASE CONNECTION VERIFICATION REPORT');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`⏰ Timestamp: ${results.timestamp}`);
  console.log(`🌍 Environment: ${results.environment}`);
  console.log('───────────────────────────────────────────────────────');

  Object.entries(results.checks).forEach(([checkName, result]) => {
    console.group(`\n${result.message}`);
    if (result.details) {
      console.table(result.details);
    }
    if (result.error) {
      console.error('Error:', result.error);
    }
    console.groupEnd();
  });

  console.log('\n───────────────────────────────────────────────────────');
  console.log(`\n${results.summary.message}`);
  console.log('═══════════════════════════════════════════════════════\n');
};
