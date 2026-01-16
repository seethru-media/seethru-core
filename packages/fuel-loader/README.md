# @seethru/fuel-loader

Loads content from external "Fuel" repositories into the seethru.media Engine.

## Concept

**Engine** = This core repository (infrastructure, apps, packages)
**Fuel** = External content repositories (MDX posts, author data, no code)

This separation allows content creators to work independently without understanding the platform infrastructure.

## Usage

### 1. Configure Fuel Sources

```typescript
import { loadAllFuels } from '@seethru/fuel-loader';

const config = {
    sources: [
        {
            id: 'sf-news',
            subdomain: 'sf',
            repository: 'https://github.com/seethru-media/fuel-sf.git',
            localPath: '../fuel-sf', // For local development
        },
    ],
};

const result = await loadAllFuels(config);
```

### 2. Use in Astro Pages

```astro
---
// src/pages/post/[slug].astro
import { loadAllFuels } from '@seethru/fuel-loader';
import { generatePostPaths } from '@seethru/fuel-loader/astro-integration';

export async function getStaticPaths() {
    const result = await loadAllFuels(config);
    return generatePostPaths(result);
}

const { post } = Astro.props;
---

<h1>{post.title}</h1>
<div set:html={post.content} />
```

## Fuel Repository Structure

A Fuel repository should follow this structure:

```
fuel-sf/
├── posts/
│   ├── 2025-01-15-city-council-meeting.mdx
│   └── 2025-01-16-transit-update.mdx
├── authors/
│   └── jane-doe.json
└── fuel.config.json
```

### Post Format (MDX)

```mdx
---
title: "City Council Approves New Housing Plan"
excerpt: "The San Francisco City Council voted 8-3 to approve..."
date: "2025-01-15"
tags: ["housing", "politics"]
aiDisclosure: "none"
---

Your MDX content here...
```

### Author Format (JSON)

```json
{
    "id": "jane-doe",
    "name": "Jane Doe",
    "slug": "jane-doe",
    "bio": "Reporter covering SF housing policy",
    "verified": true,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
}
```

## Features

- ✅ Local file system loading (for development)
- ✅ MDX parsing with frontmatter
- ✅ Zod schema validation
- ✅ Author matching
- ✅ Astro integration helpers
- ⏳ Git repository fetching (coming soon)
- ⏳ Build-time caching (coming soon)

## Development

```bash
# Type check
yarn typecheck
```
