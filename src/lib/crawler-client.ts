// Crawler Service Client - bridges DataPilot to the Python crawler microservice
import type { ExtractedIntent, CrawlerRecord, CrawlJob } from "@/types";

const CRAWLER_SERVICE_URL = process.env.CRAWLER_SERVICE_URL || "http://localhost:8001";

interface CrawlRequest {
  intent: ExtractedIntent;
  platforms?: string[];
  max_records_per_platform?: number;
  enabled_categories?: ("news" | "reviews" | "social" | "dev")[];
}

interface CrawlResponse {
  records: CrawlerRecord[];
  platform_stats: Record<string, number>;
  errors: Record<string, string>;
  total_records: number;
  crawl_duration_ms: number;
}

interface CrawlJobResponse {
  job_id: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  current_platform?: string;
  records_collected: number;
  error?: string;
  started_at: string;
  completed_at?: string;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 300000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function startLiveCrawl(request: CrawlRequest): Promise<CrawlResponse> {
  const response = await fetchWithTimeout(`${CRAWLER_SERVICE_URL}/crawl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }, 300000); // 5 min timeout for full crawl

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Crawler service error: ${response.status} ${error}`);
  }

  return response.json();
}

export async function startAsyncCrawl(request: CrawlRequest): Promise<CrawlJobResponse> {
  const response = await fetch(`${CRAWLER_SERVICE_URL}/crawl/async`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Crawler service error: ${response.status} ${error}`);
  }

  return response.json();
}

export async function pollCrawlJob(jobId: string): Promise<CrawlJobResponse> {
  const response = await fetch(`${CRAWLER_SERVICE_URL}/crawl/async/${jobId}`);
  if (!response.ok) {
    throw new Error(`Failed to poll crawl job: ${response.status}`);
  }
  return response.json();
}

export async function getAvailablePlatforms(): Promise<Array<{ id: string; name: string; category: string }>> {
  const response = await fetch(`${CRAWLER_SERVICE_URL}/platforms`);
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export function mapCrawlerRecordToSourceRecord(
  crawlerRecord: CrawlerRecord,
  taskId: string,
  intent: ExtractedIntent
): {
  id: string;
  taskId: string;
  fields: Record<string, string | number>;
  confidence: number;
  sourceName: string;
  sourceUrl: string;
  collectedAt: string;
  flagged?: boolean;
} {
  const fields: Record<string, string | number> = {
    Name: crawlerRecord.companies[0] || "Unknown",
    Platform: crawlerRecord.platform,
    Source: crawlerRecord.source,
    Text: crawlerRecord.text,
    ScrapedAt: crawlerRecord.scraped_at,
  };

  if (crawlerRecord.title) fields.Title = crawlerRecord.title;
  if (crawlerRecord.query) fields.Query = crawlerRecord.query;
  if (crawlerRecord.source_url) fields.SourceUrl = crawlerRecord.source_url;
  if (crawlerRecord.confidence_hint !== undefined) fields.ConfidenceHint = crawlerRecord.confidence_hint;

  // Base confidence from crawler hint or platform reliability
  let confidence = crawlerRecord.confidence_hint || 0.7;
  // Boost if we have a real source URL
  if (crawlerRecord.source_url && crawlerRecord.source_url.startsWith("http")) {
    confidence = Math.min(0.95, confidence + 0.1);
  }

  return {
    id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    taskId,
    fields,
    confidence: Math.round(confidence * 100) / 100,
    sourceName: crawlerRecord.platform,
    sourceUrl: crawlerRecord.source_url || crawlerRecord.source,
    collectedAt: crawlerRecord.scraped_at,
    flagged: confidence < 0.6,
  };
}

// Platform categories for UI
export const PLATFORM_CATEGORIES = {
  news: ["rss", "bbcnews", "thehackernews"],
  reviews: ["trustpilot", "googleplay", "appstore"],
  social: ["reddit", "hackernews"],
  dev: ["github"],
} as const;

export type PlatformCategory = keyof typeof PLATFORM_CATEGORIES;

export function getPlatformsForCategories(categories: PlatformCategory[]): string[] {
  return categories.flatMap(c => PLATFORM_CATEGORIES[c]);
}