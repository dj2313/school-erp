import { useState, useEffect } from 'react';
import { runAllChecks, printResults } from '../lib/supabaseVerification';

export default function SupabaseDebugPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});

  const handleRunTests = async () => {
    setLoading(true);
    const testResults = await runAllChecks();
    setResults(testResults);
    printResults(testResults); // Also print to console
    setLoading(false);
  };

  const toggleExpand = (checkName) => {
    setExpanded(prev => ({
      ...prev,
      [checkName]: !prev[checkName],
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      success: '✅ Success',
      warning: '⚠️ Warning',
      failed: '❌ Failed',
      error: '❌ Error',
    };
    return badges[status] || '❓ Unknown';
  };

  useEffect(() => {
    handleRunTests();
  }, []);

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Running Supabase verification tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔍 Supabase Connection Verification
          </h1>
          <p className="text-gray-600">Diagnostic checks for your Supabase integration</p>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Timestamp: {new Date(results.timestamp).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Environment: {results.environment}</p>
            </div>
            <button
              onClick={handleRunTests}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Running Tests...' : 'Run Tests Again'}
            </button>
          </div>
        </div>

        {/* Overall Summary */}
        <div
          className={`border-l-4 p-4 rounded-lg mb-6 ${
            results.summary.overallStatus === 'SUCCESS'
              ? 'bg-green-50 border-green-500'
              : results.summary.overallStatus === 'WARNING'
              ? 'bg-yellow-50 border-yellow-500'
              : 'bg-red-50 border-red-500'
          }`}
        >
          <h2 className="text-xl font-bold mb-2">{results.summary.message}</h2>
          <p className="text-sm text-gray-700">
            Review the individual checks below for detailed information.
          </p>
        </div>

        {/* Individual Checks */}
        <div className="space-y-4">
          {Object.entries(results.checks).map(([checkName, result]) => (
            <div
              key={checkName}
              className={`border rounded-lg overflow-hidden ${getStatusColor(result.status)}`}
            >
              <button
                onClick={() => toggleExpand(checkName)}
                className="w-full p-4 text-left font-semibold hover:bg-opacity-75 transition flex items-center justify-between"
              >
                <div>
                  <span className="mr-3">{getStatusBadge(result.status)}</span>
                  <span className="capitalize font-mono text-sm text-gray-600">
                    {checkName}
                  </span>
                </div>
                <span>{expanded[checkName] ? '▼' : '▶'}</span>
              </button>

              {expanded[checkName] && (
                <div className="px-4 pb-4 border-t border-opacity-20">
                  <p className="mb-3 font-medium text-gray-800">{result.message}</p>

                  {result.details && (
                    <div className="mb-3 bg-white bg-opacity-60 rounded p-3">
                      <h4 className="font-semibold text-sm mb-2 text-gray-700">Details:</h4>
                      <pre className="text-xs text-gray-700 overflow-auto max-h-64 bg-gray-50 p-2 rounded">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}

                  {result.error && (
                    <div className="mb-3 bg-red-100 border border-red-300 rounded p-3">
                      <h4 className="font-semibold text-sm mb-2 text-red-800">Error:</h4>
                      <pre className="text-xs text-red-700 overflow-auto">
                        {JSON.stringify(result.error, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Helper Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Troubleshooting Guide</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <p className="font-semibold">Environment Variables Not Loaded?</p>
              <p>Make sure your .env file is in the frontend root directory and restart dev server (Vite).</p>
            </div>
            <div>
              <p className="font-semibold">Network Requests Failing?</p>
              <p>Check browser DevTools → Network tab for failed requests. Verify your VITE_SUPABASE_URL is correct (no typos!).</p>
            </div>
            <div>
              <p className="font-semibold">RLS or Auth Errors?</p>
              <p>These are policy-related. Make sure your Supabase RLS policies allow public/anon access to the tables you need.</p>
            </div>
            <div>
              <p className="font-semibold">Still Having Issues?</p>
              <p>Check the browser console (F12) and the test results above for specific error messages.</p>
            </div>
          </div>
        </div>

        {/* Configuration Info */}
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">⚙️ Current Configuration</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">Supabase URL:</span>
              <span className="font-mono text-xs break-all">
                {import.meta.env.VITE_SUPABASE_URL || 'NOT SET'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Anon Key:</span>
              <span className="font-mono text-xs">
                {import.meta.env.VITE_SUPABASE_ANON_KEY
                  ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...`
                  : 'NOT SET'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">API Base URL:</span>
              <span className="font-mono text-xs">
                {import.meta.env.VITE_API_URL || 'NOT SET'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
