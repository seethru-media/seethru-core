import type { Post, Author } from '@seethru/content-schema';

/**
 * Fuel Loader Types
 *
 * "Fuel" = Content repositories separate from the engine
 * "Engine" = This core repository (seethru-core)
 */

/**
 * Source configuration for a Fuel repository
 */
export interface FuelSource {
    /** Unique identifier for this fuel source */
    id: string;

    /** Subdomain this content is associated with (e.g., 'sf' for sf.seethru.media) */
    subdomain: string;

    /** Git repository URL (https or file path for local dev) */
    repository: string;

    /** Branch to fetch from (default: 'main') */
    branch?: string;

    /** Optional authentication token for private repos */
    token?: string;

    /** Local path for development (overrides git fetching) */
    localPath?: string;
}

/**
 * Configuration for the Fuel Loader
 */
export interface FuelLoaderConfig {
    /** Array of fuel sources to load */
    sources: FuelSource[];

    /** Directory to cache fetched content (default: '.fuel-cache') */
    cacheDir?: string;

    /** Whether to use cached content (default: false in dev, true in production) */
    useCache?: boolean;

    /** Whether to validate all content against schemas (default: true) */
    validate?: boolean;
}

/**
 * Loaded content from a fuel source
 */
export interface LoadedFuel {
    /** Source this content came from */
    source: FuelSource;

    /** Loaded posts */
    posts: Post[];

    /** Loaded authors */
    authors: Author[];

    /** Load timestamp */
    loadedAt: Date;

    /** Any errors encountered during loading */
    errors: FuelLoadError[];
}

/**
 * Error during fuel loading
 */
export interface FuelLoadError {
    /** File path where error occurred */
    filePath: string;

    /** Error message */
    message: string;

    /** Error type */
    type: 'parse' | 'validation' | 'file-system' | 'git';

    /** Original error if available */
    originalError?: Error;
}

/**
 * Result of loading all fuel sources
 */
export interface FuelLoadResult {
    /** All loaded fuel sources */
    fuels: LoadedFuel[];

    /** All posts from all sources */
    allPosts: Post[];

    /** All authors from all sources */
    allAuthors: Author[];

    /** Total errors encountered */
    totalErrors: number;

    /** Whether loading was successful (no critical errors) */
    success: boolean;
}
