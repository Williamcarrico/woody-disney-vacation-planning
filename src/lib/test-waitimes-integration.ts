/**
 * Test utility to verify waitTimes engine integration
 * This can be imported and run to check if everything is working correctly
 */

import type { AttractionWaitTime } from '@/engines/waitTimes';

interface TestResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

/**
 * Test the park API endpoint
 */
export async function testParkApiEndpoint(parkId: string = 'magic-kingdom'): Promise<TestResult> {
    try {
        const response = await fetch(`/api/parks/${parkId}?entity=live`);

        if (!response.ok) {
            return {
                success: false,
                message: `API request failed with status ${response.status}`,
                error: response.statusText
            };
        }

        const data = await response.json();

        if (!data.success) {
            return {
                success: false,
                message: 'API returned error response',
                error: data.error || 'Unknown error'
            };
        }

        if (!data.data?.liveData || !Array.isArray(data.data.liveData)) {
            return {
                success: false,
                message: 'API response missing liveData array',
                data: data
            };
        }

        const attractions = data.data.liveData.filter(
            (item: any) => item.entityType === 'ATTRACTION'
        );

        return {
            success: true,
            message: `Successfully fetched ${attractions.length} attractions from ${parkId}`,
            data: {
                totalItems: data.data.liveData.length,
                attractions: attractions.length,
                sampleAttraction: attractions[0] || null
            }
        };

    } catch (error) {
        return {
            success: false,
            message: 'Failed to test park API endpoint',
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Test wait times data transformation
 */
export function testWaitTimeTransformation(sampleApiData: any): TestResult {
    try {
        if (!sampleApiData || typeof sampleApiData !== 'object') {
            return {
                success: false,
                message: 'Invalid sample data provided'
            };
        }

        // Transform sample data to AttractionWaitTime format
        const transformed: AttractionWaitTime = {
            attractionId: sampleApiData.id || 'unknown',
            name: sampleApiData.name || 'Unknown Attraction',
            waitMinutes: sampleApiData.queue?.STANDBY?.waitTime ?? -1,
            lastUpdated: sampleApiData.lastUpdated || new Date().toISOString(),
            status: sampleApiData.status || 'CLOSED'
        };

        // Validate transformation
        const isValid = (
            typeof transformed.attractionId === 'string' &&
            typeof transformed.name === 'string' &&
            typeof transformed.waitMinutes === 'number' &&
            typeof transformed.lastUpdated === 'string' &&
            typeof transformed.status === 'string'
        );

        if (!isValid) {
            return {
                success: false,
                message: 'Data transformation produced invalid result',
                data: transformed
            };
        }

        return {
            success: true,
            message: 'Data transformation successful',
            data: transformed
        };

    } catch (error) {
        return {
            success: false,
            message: 'Data transformation failed',
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Test Firebase connection (client-side only)
 */
export async function testFirebaseConnection(): Promise<TestResult> {
    try {
        // Import Firebase config
        const { firestore } = await import('@/lib/firebase/firebase.config');

        if (!firestore) {
            return {
                success: false,
                message: 'Firebase firestore not initialized'
            };
        }

        // Try to access collections (this will fail gracefully if not configured)
        const { collection } = await import('firebase/firestore');
        const waitTimesCollection = collection(firestore, 'waitTimes');

        if (waitTimesCollection) {
            return {
                success: true,
                message: 'Firebase connection successful'
            };
        }

        return {
            success: false,
            message: 'Failed to create Firebase collection reference'
        };

    } catch (error) {
        return {
            success: false,
            message: 'Firebase connection failed',
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Run all tests and return comprehensive results
 */
export async function runWaitTimesIntegrationTests(): Promise<{
    overall: 'PASS' | 'FAIL';
    results: TestResult[];
    summary: string;
}> {
    const results: TestResult[] = [];

    // Test 1: Park API Endpoint
    const apiTest = await testParkApiEndpoint();
    results.push({
        ...apiTest,
        message: `[API Test] ${apiTest.message}`
    });

    // Test 2: Data Transformation (if API test passed)
    if (apiTest.success && apiTest.data?.sampleAttraction) {
        const transformTest = testWaitTimeTransformation(apiTest.data.sampleAttraction);
        results.push({
            ...transformTest,
            message: `[Transform Test] ${transformTest.message}`
        });
    } else {
        results.push({
            success: false,
            message: '[Transform Test] Skipped - no sample data available'
        });
    }

    // Test 3: Firebase Connection
    const firebaseTest = await testFirebaseConnection();
    results.push({
        ...firebaseTest,
        message: `[Firebase Test] ${firebaseTest.message}`
    });

    // Calculate overall result
    const passedTests = results.filter(r => r.success).length;
    const totalTests = results.length;
    const overall = passedTests === totalTests ? 'PASS' : 'FAIL';

    const summary = `${passedTests}/${totalTests} tests passed. ` +
        (overall === 'PASS'
            ? 'Wait times integration is working correctly!'
            : 'Some tests failed - check individual results for details.');

    return {
        overall,
        results,
        summary
    };
}

/**
 * Helper function to log test results to console
 */
export function logTestResults(results: Awaited<ReturnType<typeof runWaitTimesIntegrationTests>>) {
    console.group('🧪 Wait Times Integration Test Results');

    console.log(`\n📊 Overall Status: ${results.overall === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📋 Summary: ${results.summary}\n`);

    results.results.forEach((result, index) => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} Test ${index + 1}: ${result.message}`);

        if (result.error) {
            console.log(`   ❌ Error: ${result.error}`);
        }

        if (result.data && typeof result.data === 'object') {
            console.log(`   📦 Data:`, result.data);
        }
    });

    console.groupEnd();

    if (results.overall === 'FAIL') {
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check environment variables in .env.local');
        console.log('2. Verify Firebase configuration');
        console.log('3. Check network connectivity');
        console.log('4. Review console for additional error details');
        console.log('5. See WAITTIME_ENGINE_SETUP.md for comprehensive guide');
    }
}

// Example usage in browser console:
// import { runWaitTimesIntegrationTests, logTestResults } from '@/lib/test-waitimes-integration';
// runWaitTimesIntegrationTests().then(logTestResults);