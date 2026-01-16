# Example Fuel Repository

This is a sample "Fuel" repository demonstrating the content structure for seethru.media.

## What is Fuel?

**Fuel** repositories contain content (posts, authors) separate from the platform infrastructure.
**Engine** is the main seethru-core repository with apps, packages, and infrastructure.

This separation allows content creators to work independently without understanding the platform.

## Structure

```
fuel-example/
├── posts/           # MDX blog posts
├── authors/         # Author JSON files
├── fuel.config.json # Configuration
└── README.md        # This file
```

## How to Use

1. Create posts in the `posts/` directory
2. Create author profiles in the `authors/` directory
3. Reference this directory in the Engine's fuel loader config

## For Content Creators

You only need to:
- Write MDX posts with required frontmatter
- Create author JSON files
- Commit and push to your fuel repository

The Engine handles building, publishing, and serving your content.
