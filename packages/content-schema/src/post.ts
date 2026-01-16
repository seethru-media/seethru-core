import { z } from 'zod';

/**
 * Post Schema
 * Standard blog/article content type
 */
export const PostSchema = z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
    excerpt: z.string().max(300),

    // Content
    content: z.string(), // MDX content
    lowDataSummary: z.string().max(500), // Required for low-bandwidth mode

    // Author (required - no anonymous posts)
    authorId: z.string(),
    authorName: z.string(),

    // Source
    subdomain: z.string(),
    source: z.string().default('seethru.media'),
    sourceUrl: z.string().url().optional(),

    // Categorization
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),

    // Media
    coverImage: z.string().url().optional(),
    coverImageAlt: z.string().optional(),

    // AI disclosure (Platform Charter requirement)
    aiDisclosure: z.enum(['none', 'ai-assisted', 'ai-generated']).default('none'),

    // Metadata
    publishedAt: z.string().datetime(),
    updatedAt: z.string().datetime(),

    // Moderation
    status: z.enum(['draft', 'pending', 'published', 'removed']).default('draft'),

    // Version (for correction history)
    version: z.number().int().default(1),
});

export type Post = z.infer<typeof PostSchema>;

/**
 * Post Frontmatter Schema
 * What authors provide in their MDX files
 */
export const PostFrontmatterSchema = PostSchema.pick({
    title: true,
    subtitle: true,
    excerpt: true,
    tags: true,
    category: true,
    coverImage: true,
    coverImageAlt: true,
    aiDisclosure: true,
}).extend({
    date: z.string(), // Will be parsed to publishedAt
    author: z.string().optional(), // Author ID, optional (defaults to first author in fuel source)
});

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;
