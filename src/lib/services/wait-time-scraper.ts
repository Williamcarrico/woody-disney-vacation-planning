import { createClient } from '@supabase/supabase-js';

/**
 * Advanced Wait Time Data Scraping Service
 *
 * This service implements sophisticated web scraping techniques to gather
 * wait time data from multiple sources, providing comprehensive coverage
 * beyond the primary ThemeParks.wiki API.
 */

// Types for scraped data
interface ScrapedWaitTime {
    attractionId: string;
    attractionName: string;
    parkId: string;
    waitTime: number;
    status: 'OPERATING' | 'DOWN' | 'CLOSED' | 'REFURBISHMENT';
    source: string;
    timestamp: string;
    confidence: number; // 0-1 confidence score
    metadata?: {
        crowdLevel?: string;
        weatherConditions?: string;
        specialEvents?: string[];
        fastPassAvailable?: boolean;
        singleRiderAvailable?: boolean;
    };
}

interface ScrapingTarget {
    name: string;
    url: string;
    selectors: {
        attractionContainer: string;
        attractionName: string;
        waitTime: string;
        status: string;
    };
    parkId: string;
    enabled: boolean;
    rateLimit: number; // requests per minute
}

interface ScrapingSession {
    id: string;
    startTime: Date;
    endTime?: Date;
    targetsProcessed: number;
    dataPointsCollected: number;
    errors: string[];
    status: 'RUNNING' | 'COMPLETED' | 'FAILED';
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configuration for scraping targets
const SCRAPING_TARGETS: ScrapingTarget[] = [
    {
        name: 'TouringPlans',
        url: 'https://touringplans.com/walt-disney-world/crowd-calendar',
        selectors: {
            attractionContainer: '.attraction-wait-time',
            attractionName: '.attraction-name',
            waitTime: '.wait-time-value',
            status: '.attraction-status'
        },
        parkId: 'magic-kingdom',
        enabled: true,
        rateLimit: 10
    },
    {
        name: 'WDWStats',
        url: 'https://www.wdwstats.com/waittimes',
        selectors: {
            attractionContainer: '.wait-time-row',
            attractionName: '.attraction-title',
            waitTime: '.current-wait',
            status: '.status-indicator'
        },
        parkId: 'all',
        enabled: true,
        rateLimit: 15
    },
    {
        name: 'QueueTimes',
        url: 'https://queue-times.com/parks/7/queue_times',
        selectors: {
            attractionContainer: '.ride-row',
            attractionName: '.ride-name',
            waitTime: '.wait-time',
            status: '.ride-status'
        },
        parkId: 'magic-kingdom',
        enabled: true,
        rateLimit: 20
    }
];

// Rate limiting and request management
class RateLimiter {
    private requests: Map<string, number[]> = new Map();

    canMakeRequest(target: string, limit: number): boolean {
        const now = Date.now();
        const requests = this.requests.get(target) || [];

        // Remove requests older than 1 minute
        const recentRequests = requests.filter(time => now - time < 60000);
        this.requests.set(target, recentRequests);

        return recentRequests.length < limit;
    }

    recordRequest(target: string): void {
        const requests = this.requests.get(target) || [];
        requests.push(Date.now());
        this.requests.set(target, requests);
    }
}

// Advanced scraping engine with stealth capabilities
class WaitTimeScrapingEngine {
    private rateLimiter = new RateLimiter();
    private userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];

    private getRandomUserAgent(): string {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async scrapeTarget(target: ScrapingTarget): Promise<ScrapedWaitTime[]> {
        if (!target.enabled) {
            throw new Error(`Target ${target.name} is disabled`);
        }

        if (!this.rateLimiter.canMakeRequest(target.name, target.rateLimit)) {
            throw new Error(`Rate limit exceeded for ${target.name}`);
        }

        try {
            // Record the request
            this.rateLimiter.recordRequest(target.name);

            // Add random delay to appear more human-like
            await this.delay(Math.random() * 2000 + 1000);

            // Use fetch with stealth headers
            const response = await fetch(target.url, {
                headers: {
                    'User-Agent': this.getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Cache-Control': 'max-age=0'
                },
                signal: AbortSignal.timeout(30000) // 30 second timeout
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            return this.parseWaitTimes(html, target);

        } catch (error) {
            console.error(`Error scraping ${target.name}:`, error);
            throw error;
        }
    }

    private parseWaitTimes(html: string, target: ScrapingTarget): ScrapedWaitTime[] {
        // This is a simplified parser - in a real implementation, you'd use a proper HTML parser
        // like Cheerio or Playwright for more robust parsing
        const waitTimes: ScrapedWaitTime[] = [];

        try {
            // Basic regex-based parsing (would be replaced with proper DOM parsing)
            const attractionRegex = new RegExp(
                `<[^>]*class="[^"]*${target.selectors.attractionContainer.replace('.', '')}[^"]*"[^>]*>([\\s\\S]*?)</[^>]*>`,
                'gi'
            );

            let match;
            while ((match = attractionRegex.exec(html)) !== null) {
                const attractionHtml = match[1];

                // Extract attraction name
                const nameMatch = attractionHtml.match(new RegExp(
                    `<[^>]*class="[^"]*${target.selectors.attractionName.replace('.', '')}[^"]*"[^>]*>([^<]+)`,
                    'i'
                ));

                // Extract wait time
                const waitTimeMatch = attractionHtml.match(new RegExp(
                    `<[^>]*class="[^"]*${target.selectors.waitTime.replace('.', '')}[^"]*"[^>]*>([^<]+)`,
                    'i'
                ));

                // Extract status
                const statusMatch = attractionHtml.match(new RegExp(
                    `<[^>]*class="[^"]*${target.selectors.status.replace('.', '')}[^"]*"[^>]*>([^<]+)`,
                    'i'
                ));

                if (nameMatch && waitTimeMatch) {
                    const attractionName = nameMatch[1].trim();
                    const waitTimeText = waitTimeMatch[1].trim();
                    const statusText = statusMatch?.[1]?.trim() || 'OPERATING';

                    // Parse wait time (extract number from text like "45 min" or "45")
                    const waitTimeNumber = parseInt(waitTimeText.match(/\d+/)?.[0] || '0');

                    // Map status text to our enum
                    let status: ScrapedWaitTime['status'] = 'OPERATING';
                    const statusLower = statusText.toLowerCase();
                    if (statusLower.includes('down') || statusLower.includes('closed')) {
                        status = 'DOWN';
                    } else if (statusLower.includes('refurb')) {
                        status = 'REFURBISHMENT';
                    }

                    waitTimes.push({
                        attractionId: this.generateAttractionId(attractionName),
                        attractionName,
                        parkId: target.parkId,
                        waitTime: waitTimeNumber,
                        status,
                        source: target.name,
                        timestamp: new Date().toISOString(),
                        confidence: 0.8, // Base confidence for scraped data
                        metadata: {
                            fastPassAvailable: attractionHtml.toLowerCase().includes('fastpass') ||
                                attractionHtml.toLowerCase().includes('lightning lane'),
                            singleRiderAvailable: attractionHtml.toLowerCase().includes('single rider')
                        }
                    });
                }
            }

        } catch (error) {
            console.error(`Error parsing HTML from ${target.name}:`, error);
        }

        return waitTimes;
    }

    private generateAttractionId(name: string): string {
        return name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .trim();
    }
}

// Data validation and quality assurance
class DataValidator {
    validateWaitTime(data: ScrapedWaitTime): boolean {
        // Basic validation rules
        if (!data.attractionId || !data.attractionName) return false;
        if (data.waitTime < 0 || data.waitTime > 300) return false; // Reasonable wait time bounds
        if (!['OPERATING', 'DOWN', 'CLOSED', 'REFURBISHMENT'].includes(data.status)) return false;
        if (data.confidence < 0 || data.confidence > 1) return false;

        return true;
    }

    crossValidateData(dataPoints: ScrapedWaitTime[]): ScrapedWaitTime[] {
        // Group by attraction
        const groupedData = new Map<string, ScrapedWaitTime[]>();

        dataPoints.forEach(point => {
            const key = `${point.parkId}-${point.attractionId}`;
            if (!groupedData.has(key)) {
                groupedData.set(key, []);
            }
            const group = groupedData.get(key);
            if (group) {
                group.push(point);
            }
        });

        const validatedData: ScrapedWaitTime[] = [];

        // For each attraction, validate against multiple sources
        groupedData.forEach((points) => {
            if (points.length === 1) {
                // Single source - use as is but lower confidence
                const point = { ...points[0] };
                point.confidence *= 0.7;
                validatedData.push(point);
            } else {
                // Multiple sources - cross-validate
                const waitTimes = points.map(p => p.waitTime);
                const avgWaitTime = waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length;
                const variance = waitTimes.reduce((sum, time) => sum + Math.pow(time - avgWaitTime, 2), 0) / waitTimes.length;

                // If variance is low, data is consistent
                const consistencyScore = Math.max(0, 1 - (variance / 100));

                // Use the most recent data point with adjusted confidence
                const latestPoint = points.sort((a, b) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                )[0];

                latestPoint.confidence = Math.min(1, latestPoint.confidence * (1 + consistencyScore));
                latestPoint.waitTime = Math.round(avgWaitTime); // Use average wait time

                validatedData.push(latestPoint);
            }
        });

        return validatedData;
    }
}

// Main scraping orchestrator
export class WaitTimeDataCollector {
    private engine = new WaitTimeScrapingEngine();
    private validator = new DataValidator();
    private activeSessions = new Map<string, ScrapingSession>();

    async startScrapingSession(): Promise<string> {
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const session: ScrapingSession = {
            id: sessionId,
            startTime: new Date(),
            targetsProcessed: 0,
            dataPointsCollected: 0,
            errors: [],
            status: 'RUNNING'
        };

        this.activeSessions.set(sessionId, session);

        // Start scraping in background
        this.runScrapingSession(sessionId).catch(error => {
            console.error(`Scraping session ${sessionId} failed:`, error);
            session.status = 'FAILED';
            session.errors.push(error.message);
        });

        return sessionId;
    }

    private async runScrapingSession(sessionId: string): Promise<void> {
        const session = this.activeSessions.get(sessionId);
        if (!session) throw new Error('Session not found');

        try {
            const allScrapedData: ScrapedWaitTime[] = [];

            // Process each target
            for (const target of SCRAPING_TARGETS) {
                if (!target.enabled) continue;

                try {
                    console.log(`Scraping ${target.name}...`);
                    const data = await this.engine.scrapeTarget(target);

                    // Validate individual data points
                    const validData = data.filter(point => this.validator.validateWaitTime(point));

                    allScrapedData.push(...validData);
                    session.targetsProcessed++;
                    session.dataPointsCollected += validData.length;

                    // Add delay between targets
                    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

                } catch (error) {
                    console.error(`Error processing target ${target.name}:`, error);
                    session.errors.push(`${target.name}: ${error instanceof Error ? error.message : String(error)}`);
                }
            }

            // Cross-validate data from multiple sources
            const validatedData = this.validator.crossValidateData(allScrapedData);

            // Store validated data
            await this.storeScrapedData(validatedData);

            session.status = 'COMPLETED';
            session.endTime = new Date();
            session.dataPointsCollected = validatedData.length;

            console.log(`Scraping session ${sessionId} completed. Collected ${validatedData.length} data points.`);

        } catch (error) {
            session.status = 'FAILED';
            session.errors.push(error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    private async storeScrapedData(data: ScrapedWaitTime[]): Promise<void> {
        try {
            // Store in scraped_wait_times table
            const { error } = await supabase
                .from('scraped_wait_times')
                .insert(data.map(point => ({
                    attraction_id: point.attractionId,
                    attraction_name: point.attractionName,
                    park_id: point.parkId,
                    wait_time: point.waitTime,
                    status: point.status,
                    source: point.source,
                    timestamp: point.timestamp,
                    confidence: point.confidence,
                    metadata: point.metadata
                })));

            if (error) {
                console.error('Error storing scraped data:', error);
                throw error;
            }

            // Also update the live_wait_times table with high-confidence data
            const highConfidenceData = data.filter(point => point.confidence > 0.8);

            for (const point of highConfidenceData) {
                await supabase
                    .from('live_wait_times')
                    .upsert({
                        attractionId: point.attractionId,
                        waitMinutes: point.waitTime,
                        status: point.status,
                        timestamp: point.timestamp,
                        source: `scraped-${point.source}`,
                        confidence: point.confidence
                    });
            }

        } catch (error) {
            console.error('Error storing scraped data:', error);
            throw error;
        }
    }

    getSessionStatus(sessionId: string): ScrapingSession | null {
        return this.activeSessions.get(sessionId) || null;
    }

    async getRecentScrapedData(hours = 24): Promise<ScrapedWaitTime[]> {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

        const { data, error } = await supabase
            .from('scraped_wait_times')
            .select('*')
            .gte('timestamp', since)
            .order('timestamp', { ascending: false });

        if (error) {
            console.error('Error fetching scraped data:', error);
            return [];
        }

        return data.map(row => ({
            attractionId: row.attraction_id,
            attractionName: row.attraction_name,
            parkId: row.park_id,
            waitTime: row.wait_time,
            status: row.status,
            source: row.source,
            timestamp: row.timestamp,
            confidence: row.confidence,
            metadata: row.metadata
        }));
    }

    // Analytics and insights
    async generateDataQualityReport(): Promise<{
        totalDataPoints: number;
        sourceBreakdown: Record<string, number>;
        averageConfidence: number;
        dataFreshness: number; // hours since last update
        consistencyScore: number;
    }> {
        const recentData = await this.getRecentScrapedData(24);

        const sourceBreakdown: Record<string, number> = {};
        let totalConfidence = 0;

        recentData.forEach(point => {
            sourceBreakdown[point.source] = (sourceBreakdown[point.source] || 0) + 1;
            totalConfidence += point.confidence;
        });

        const averageConfidence = recentData.length > 0 ? totalConfidence / recentData.length : 0;

        // Calculate data freshness
        const latestTimestamp = recentData.length > 0
            ? Math.max(...recentData.map(p => new Date(p.timestamp).getTime()))
            : 0;
        const dataFreshness = latestTimestamp > 0
            ? (Date.now() - latestTimestamp) / (1000 * 60 * 60)
            : 24;

        // Calculate consistency score (simplified)
        const consistencyScore = averageConfidence;

        return {
            totalDataPoints: recentData.length,
            sourceBreakdown,
            averageConfidence,
            dataFreshness,
            consistencyScore
        };
    }
}

// Export singleton instance
export const waitTimeCollector = new WaitTimeDataCollector();

// Utility functions for integration
export async function triggerDataCollection(): Promise<string> {
    return await waitTimeCollector.startScrapingSession();
}

export async function getDataQualityMetrics() {
    return await waitTimeCollector.generateDataQualityReport();
}

export async function getScrapingSessionStatus(sessionId: string) {
    return waitTimeCollector.getSessionStatus(sessionId);
}