# My Backend Blog (Jekyll starter)

A minimal Jekyll blog with two example posts (Outbox pattern in Spring Boot,
and Java `ExecutorService` basics), a simple default/post layout, and
lightweight CSS with syntax-highlighted code blocks.

## Run locally

```bash
gem install bundler
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000

## Structure

```
.
├── _config.yml          # site settings
├── Gemfile               # Ruby/Jekyll dependencies
├── index.md               # homepage, lists all posts
├── _posts/                 # blog posts (Markdown, filename = YYYY-MM-DD-title.md)
├── _layouts/
│   ├── default.html        # base HTML shell
│   └── post.html           # wraps posts with title/date/tags
└── assets/css/style.css   # styling
```

## Add a new post

Create a file in `_posts/` named `YYYY-MM-DD-your-title.md`:

```markdown
---
title: "Your Title"
date: 2026-02-01 09:00:00 +0100
tags: [tag1, tag2]
excerpt: "One sentence summary."
---

Post content here, including ```code fences``` for syntax highlighting.
```

## Deploy

Works out of the box with GitHub Pages, Netlify, or Cloudflare Pages
(build command: `bundle exec jekyll build`, output dir: `_site`).
