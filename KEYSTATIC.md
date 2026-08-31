# Keystatic CMS Setup Guide

This guide walks through setting up Keystatic for content management with GitHub integration and Cloudflare deployment.

## Overview

Keystatic is a content management system that allows you to:
- **Locally**: Edit content via an admin UI at `/keystatic` during development
- **Production**: Edit content from your deployed site with GitHub OAuth authentication
- **Git Integration**: All changes are automatically committed to your GitHub repository

## Prerequisites

- Node.js >= 22
- A GitHub account with push access to this repository
- A Cloudflare Workers account (for production deployment)

## Local Development Setup

### 1. Start the Development Server

```bash
npm run dev
```

The Astro dev server will start on `http://127.0.0.1:4321/`.

### 2. Access the Admin UI

Navigate to: **http://127.0.0.1:4321/keystatic**

You'll see the Keystatic admin interface with a "Blog" collection containing all your blog posts.

### 3. Create/Edit Content

- **Creating a post**: Click "Create blog post" and fill in the form
  - **Title**: Used as the URL slug and filename
  - **Description**: Short summary of the post
  - **Publish date**: When the post was published
  - **Updated date**: Last modification date (optional)
  - **Hero image**: URL to featured image
  - **Content**: Rich text editor powered by Markdoc

- **Editing a post**: Click on an existing post to modify it

- **Publishing**: Click "Save" to write the `.mdoc` file to `src/content/blog/`

### 4. Verify Content

After saving, verify your post appears:
- Check `src/content/blog/<title>.mdoc` file was created
- Visit your blog page to see the new post rendered
- Content is automatically included in your site

## Production Setup: GitHub OAuth Integration

To enable editing on your deployed site, you need to connect Keystatic to GitHub using OAuth.

### Step 1: Create a GitHub OAuth Application

1. Go to **GitHub Settings** → **Developer settings** → **OAuth Apps**
   - Direct link: https://github.com/settings/developers

2. Click **"New OAuth App"** and fill in:
   - **Application name**: `Ankersted Web CMS`
   - **Homepage URL**: Your production domain (e.g., `https://ankersted.com`)
   - **Application description**: Content management for blog posts
   - **Authorization callback URL**: `https://your-domain.com/keystatic/github/callback`
     - Replace `your-domain.com` with your actual Cloudflare Workers domain

3. Click **"Register application"**

4. Copy the following values:
   - **Client ID** (visible immediately)
   - **Client Secret** (click "Generate a new client secret")
   - Keep these secure! Don't share or commit to git.

### Step 2: Configure Local Environment

1. Copy values from Step 1 into `.env.local`:

```bash
KEYSTATIC_GITHUB_CLIENT_ID=your_client_id_here
KEYSTATIC_GITHUB_CLIENT_SECRET=your_client_secret_here
KEYSTATIC_SECRET=your_random_secret_here
KEYSTATIC_GITHUB_REPO_SLUG=alexhornbake/ankersted-web
KEYSTATIC_GITHUB_BRANCH=main
```

2. Generate a secure random secret for `KEYSTATIC_SECRET`:

```bash
openssl rand -hex 32
```

3. **IMPORTANT**: `.env.local` is in `.gitignore` and will never be committed to git.

### Step 3: Test Locally with GitHub Mode

1. Run the dev server again:

```bash
npm run dev
```

2. Keystatic will now use GitHub storage instead of local storage

3. When you save content, it will commit directly to your GitHub repository

4. Verify by checking the GitHub repository for new commits

## Production Deployment

### Step 1: Set Cloudflare Secrets

Set the same environment variables on Cloudflare Workers:

```bash
wrangler secret put KEYSTATIC_GITHUB_CLIENT_ID
# Paste your Client ID and press Enter

wrangler secret put KEYSTATIC_GITHUB_CLIENT_SECRET
# Paste your Client Secret and press Enter

wrangler secret put KEYSTATIC_SECRET
# Paste your random secret and press Enter
```

### Step 2: Update GitHub OAuth App

After your site is deployed on Cloudflare Workers:

1. Go back to github.com/settings/developers
2. Edit your OAuth application
3. Update **Authorization callback URL** to your actual Cloudflare domain:
   ```
   https://your-workers-domain.workers.dev/keystatic/github/callback
   ```
4. Save changes

### Step 3: Deploy to Cloudflare

```bash
npm run build    # Build the static site
npm run deploy   # Deploy to Cloudflare Workers
```

### Step 4: Verify Production

1. Visit your production domain
2. Navigate to `/keystatic` on your production site
3. You'll be prompted to authorize with GitHub
4. After linking, you can edit content directly on your live site
5. Changes automatically commit to your git repository

## Content Workflow

### For Content Editors

1. **Edit locally**: Run `npm run dev`, access `/keystatic`, make changes, save
2. **Edit remotely**: Visit your production site, go to `/keystatic`, authenticate with GitHub, edit
3. **Git auto-sync**: All changes are committed to GitHub automatically
4. **Developers pull**: When developers need changes locally, they run `git pull`

### For Developers

1. Pull latest changes: `git pull`
2. Run locally: `npm run dev`
3. All content is in `src/content/blog/` as `.mdoc` files
4. Content is built into your static site during `npm run build`

## Verification Checklist

- [ ] Local dev server runs: `npm run dev`
- [ ] Admin UI loads: http://127.0.0.1:4321/keystatic
- [ ] Can create/edit/delete posts locally
- [ ] New posts appear in `src/content/blog/`
- [ ] GitHub OAuth app created
- [ ] `.env.local` populated with secrets
- [ ] Site builds without errors: `npm run build`
- [ ] Deployed to Cloudflare: `npm run deploy`
- [ ] Production admin UI loads: https://your-domain/keystatic
- [ ] Can edit content on production
- [ ] Changes appear in GitHub repository

## Troubleshooting

### Admin UI shows "Local storage mode" in production

**Issue**: GitHub environment variables not set on Cloudflare Workers.

**Solution**:
```bash
wrangler secret put KEYSTATIC_GITHUB_CLIENT_ID
wrangler secret put KEYSTATIC_GITHUB_CLIENT_SECRET
wrangler secret put KEYSTATIC_SECRET
wrangler deploy
```

### "Invalid callback URL" error

**Issue**: GitHub OAuth redirect URL doesn't match configuration.

**Solution**:
1. Check GitHub OAuth app settings
2. Verify callback URL matches your Cloudflare Workers domain
3. Make sure URL ends with `/keystatic/github/callback`

### Changes not appearing in GitHub

**Issue**: Keystatic → GitHub integration not working.

**Solution**:
1. Verify `KEYSTATIC_GITHUB_CLIENT_SECRET` is correct
2. Check GitHub OAuth app permissions allow "repo" scope
3. Verify the OAuth app is authorized for your repository

### Port already in use

**Issue**: Astro tries to start on 4321 but port is occupied.

**Solution**:
```bash
npm run dev -- --port 3000
```

## Next Steps

1. **Custom Markdoc components**: Extend the content editor with custom rich text components
2. **Content scheduling**: Add publish date scheduling (future feature)
3. **Webhooks**: Trigger rebuilds on content changes
4. **Version history**: Enable content versioning with git history
5. **Team collaboration**: Set up branch protection and code review for content changes

## Resources

- [Keystatic Documentation](https://keystatic.com/docs)
- [Keystatic GitHub Integration](https://keystatic.com/docs/github-mode)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Astro Keystatic Integration](https://docs.astro.build/en/guides/integrations-guide/keystatic/)
