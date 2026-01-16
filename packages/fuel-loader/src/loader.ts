import * as fs from 'fs';
import * as path from 'path';
import type { Post, Author } from '@seethru/content-schema';
import type { FuelSource, LoadedFuel, FuelLoadError, FuelLoaderConfig, FuelLoadResult } from './types';
import { parsePost, parseAuthor } from './parser';

/**
 * Load content from a single fuel source
 */
export async function loadFuel(source: FuelSource): Promise<LoadedFuel> {
    const errors: FuelLoadError[] = [];
    const posts: Post[] = [];
    const authors: Author[] = [];

    // For MVP, only support local paths
    // Git fetching will be added in phase 2
    if (!source.localPath) {
        errors.push({
            filePath: source.repository,
            message: 'Git fetching not yet implemented. Please use localPath for development.',
            type: 'git',
        });

        return {
            source,
            posts,
            authors,
            loadedAt: new Date(),
            errors,
        };
    }

    // Verify local path exists
    if (!fs.existsSync(source.localPath)) {
        errors.push({
            filePath: source.localPath,
            message: `Local path does not exist: ${source.localPath}`,
            type: 'file-system',
        });

        return {
            source,
            posts,
            authors,
            loadedAt: new Date(),
            errors,
        };
    }

    // Load posts from posts/ directory
    const postsDir = path.join(source.localPath, 'posts');
    if (fs.existsSync(postsDir)) {
        const postResults = await loadPostsFromDirectory(postsDir, source.subdomain);
        posts.push(...postResults.posts);
        errors.push(...postResults.errors);
    }

    // Load authors from authors/ directory
    const authorsDir = path.join(source.localPath, 'authors');
    if (fs.existsSync(authorsDir)) {
        const authorResults = await loadAuthorsFromDirectory(authorsDir);
        authors.push(...authorResults.authors);
        errors.push(...authorResults.errors);
    }

    // Match author names to posts
    const authorMap = new Map(authors.map(a => [a.id, a.name]));
    for (const post of posts) {
        const authorName = authorMap.get(post.authorId);
        if (authorName) {
            post.authorName = authorName;
        }
    }

    return {
        source,
        posts,
        authors,
        loadedAt: new Date(),
        errors,
    };
}

/**
 * Load all posts from a directory
 */
async function loadPostsFromDirectory(
    dir: string,
    subdomain: string
): Promise<{ posts: Post[]; errors: FuelLoadError[] }> {
    const posts: Post[] = [];
    const errors: FuelLoadError[] = [];

    const files = fs.readdirSync(dir);

    for (const file of files) {
        if (!file.endsWith('.mdx') && !file.endsWith('.md')) {
            continue;
        }

        const filePath = path.join(dir, file);
        const relativePath = path.relative(process.cwd(), filePath);

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const result = parsePost(content, relativePath, subdomain);

            if (result.post) {
                posts.push(result.post);
            }
            errors.push(...result.errors);
        } catch (error) {
            errors.push({
                filePath: relativePath,
                message: `Failed to read file: ${error instanceof Error ? error.message : String(error)}`,
                type: 'file-system',
                originalError: error instanceof Error ? error : undefined,
            });
        }
    }

    return { posts, errors };
}

/**
 * Load all authors from a directory
 */
async function loadAuthorsFromDirectory(
    dir: string
): Promise<{ authors: Author[]; errors: FuelLoadError[] }> {
    const authors: Author[] = [];
    const errors: FuelLoadError[] = [];

    const files = fs.readdirSync(dir);

    for (const file of files) {
        if (!file.endsWith('.json')) {
            continue;
        }

        const filePath = path.join(dir, file);
        const relativePath = path.relative(process.cwd(), filePath);

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const result = parseAuthor(content, relativePath);

            if (result.author) {
                authors.push(result.author);
            }
            errors.push(...result.errors);
        } catch (error) {
            errors.push({
                filePath: relativePath,
                message: `Failed to read author file: ${error instanceof Error ? error.message : String(error)}`,
                type: 'file-system',
                originalError: error instanceof Error ? error : undefined,
            });
        }
    }

    return { authors, errors };
}

/**
 * Load content from all configured fuel sources
 */
export async function loadAllFuels(config: FuelLoaderConfig): Promise<FuelLoadResult> {
    const fuels: LoadedFuel[] = [];

    // Load all sources
    for (const source of config.sources) {
        const fuel = await loadFuel(source);
        fuels.push(fuel);
    }

    // Aggregate all posts and authors
    const allPosts = fuels.flatMap(f => f.posts);
    const allAuthors = fuels.flatMap(f => f.authors);

    // Count total errors
    const totalErrors = fuels.reduce((sum, f) => sum + f.errors.length, 0);

    // Sort posts by date (newest first)
    allPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return {
        fuels,
        allPosts,
        allAuthors,
        totalErrors,
        success: totalErrors === 0,
    };
}
