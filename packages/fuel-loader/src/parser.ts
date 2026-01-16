import matter from 'gray-matter';
import { PostFrontmatterSchema, AuthorSchema, type Post, type Author } from '@seethru/content-schema';
import type { FuelLoadError } from './types';

/**
 * Parse an MDX file into a Post object
 */
export function parsePost(
    content: string,
    filePath: string,
    subdomain: string,
    authorId: string = 'unknown'
): { post: Post | null; errors: FuelLoadError[] } {
    const errors: FuelLoadError[] = [];

    try {
        // Parse frontmatter
        const { data: frontmatter, content: mdxContent } = matter(content);

        // Validate frontmatter against schema
        const validationResult = PostFrontmatterSchema.safeParse(frontmatter);

        if (!validationResult.success) {
            errors.push({
                filePath,
                message: `Frontmatter validation failed: ${validationResult.error.message}`,
                type: 'validation',
                originalError: validationResult.error,
            });
            return { post: null, errors };
        }

        const validated = validationResult.data;

        // Extract slug from file path (e.g., 'posts/hello-world.mdx' -> 'hello-world')
        const slug = extractSlug(filePath);

        // Generate ID from subdomain and slug
        const id = `${subdomain}:${slug}`;

        // Use author from frontmatter if provided, otherwise use default
        const postAuthorId = validated.author || authorId;

        // Build Post object
        const post: Post = {
            id,
            slug,
            title: validated.title,
            subtitle: validated.subtitle,
            excerpt: validated.excerpt,
            content: mdxContent,
            lowDataSummary: extractLowDataSummary(mdxContent, validated.excerpt),
            authorId: postAuthorId,
            authorName: 'Unknown', // Will be populated when we have author data
            subdomain,
            source: 'seethru.media',
            sourceUrl: undefined,
            tags: validated.tags || [],
            category: validated.category,
            coverImage: validated.coverImage,
            coverImageAlt: validated.coverImageAlt,
            aiDisclosure: validated.aiDisclosure || 'none',
            publishedAt: new Date(validated.date).toISOString(),
            updatedAt: new Date(validated.date).toISOString(),
            status: 'published',
            version: 1,
        };

        return { post, errors: [] };
    } catch (error) {
        errors.push({
            filePath,
            message: `Failed to parse MDX: ${error instanceof Error ? error.message : String(error)}`,
            type: 'parse',
            originalError: error instanceof Error ? error : undefined,
        });
        return { post: null, errors };
    }
}

/**
 * Parse an author JSON/YAML file into an Author object
 */
export function parseAuthor(
    content: string,
    filePath: string
): { author: Author | null; errors: FuelLoadError[] } {
    const errors: FuelLoadError[] = [];

    try {
        // Parse as JSON (we'll support YAML later if needed)
        const data = JSON.parse(content);

        // Validate against schema
        const validationResult = AuthorSchema.safeParse(data);

        if (!validationResult.success) {
            errors.push({
                filePath,
                message: `Author validation failed: ${validationResult.error.message}`,
                type: 'validation',
                originalError: validationResult.error,
            });
            return { author: null, errors };
        }

        return { author: validationResult.data, errors: [] };
    } catch (error) {
        errors.push({
            filePath,
            message: `Failed to parse author file: ${error instanceof Error ? error.message : String(error)}`,
            type: 'parse',
            originalError: error instanceof Error ? error : undefined,
        });
        return { author: null, errors };
    }
}

/**
 * Extract slug from file path
 * Examples:
 *   'posts/hello-world.mdx' -> 'hello-world'
 *   'content/posts/2025-01-16-news.mdx' -> '2025-01-16-news'
 */
function extractSlug(filePath: string): string {
    const fileName = filePath.split('/').pop() || '';
    return fileName.replace(/\.mdx?$/, '');
}

/**
 * Generate a low-data summary from content
 * For now, just use the excerpt, but this could be smarter
 */
function extractLowDataSummary(content: string, excerpt: string): string {
    // For MVP, use excerpt as low-data summary
    // TODO: In the future, this could strip images, generate text-only version, etc.
    return excerpt.slice(0, 500);
}
