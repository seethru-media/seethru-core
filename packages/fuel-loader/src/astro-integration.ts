/**
 * Astro Integration for Fuel Loader
 *
 * Provides utilities to use loaded content in Astro's getStaticPaths and pages
 */

import type { Post, Author } from '@seethru/content-schema';
import type { FuelLoadResult } from './types';

/**
 * Generate static paths for all posts
 * Use this in Astro's getStaticPaths()
 */
export function generatePostPaths(result: FuelLoadResult) {
    return result.allPosts.map(post => ({
        params: { slug: post.slug },
        props: { post },
    }));
}

/**
 * Generate static paths for all authors
 * Use this in Astro's getStaticPaths()
 */
export function generateAuthorPaths(result: FuelLoadResult) {
    return result.allAuthors.map(author => ({
        params: { slug: author.slug },
        props: { author },
    }));
}

/**
 * Get posts for a daily brief
 * Organized by geographic scope
 */
export interface DailyBriefOptions {
    /** Filter by subdomain (e.g., 'sf' for San Francisco) */
    subdomain?: string;

    /** Maximum number of posts per section */
    limit?: number;

    /** Date to get brief for (defaults to today) */
    date?: Date;
}

export function getDailyBrief(result: FuelLoadResult, options: DailyBriefOptions = {}) {
    const { subdomain, limit = 10 } = options;

    // Filter by subdomain if specified
    let posts = subdomain
        ? result.allPosts.filter(p => p.subdomain === subdomain)
        : result.allPosts;

    // For now, just return top posts
    // TODO: Implement geographic hierarchy (neighborhood -> city -> country -> world)
    return posts.slice(0, limit);
}

/**
 * Get a post by slug
 */
export function getPostBySlug(result: FuelLoadResult, slug: string): Post | undefined {
    return result.allPosts.find(p => p.slug === slug);
}

/**
 * Get an author by slug
 */
export function getAuthorBySlug(result: FuelLoadResult, slug: string): Author | undefined {
    return result.allAuthors.find(a => a.slug === slug);
}

/**
 * Get posts by author
 */
export function getPostsByAuthor(result: FuelLoadResult, authorId: string): Post[] {
    return result.allPosts.filter(p => p.authorId === authorId);
}

/**
 * Get posts by tag
 */
export function getPostsByTag(result: FuelLoadResult, tag: string): Post[] {
    return result.allPosts.filter(p => p.tags.includes(tag));
}
