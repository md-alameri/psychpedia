# Vercel Auto-Deployment Setup Guide

This guide will help you set up automatic deployment from GitHub to Vercel.

## Option 1: Vercel Dashboard (Recommended - Easiest)

This is the simplest method and recommended for most users.

### Steps:

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `md-alameri/psychpedia`
   - Vercel will automatically detect it's a Next.js project

3. **Configure Project Settings**
   - **Root Directory**: Set to `psychpedia-landing-v2` (since your Next.js app is in a subdirectory)
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (already configured)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Environment Variables** (if needed)
   - Add any environment variables your app needs
   - These will be available during build and runtime

5. **Deploy**
   - Click "Deploy"
   - Vercel will:
     - Install dependencies
     - Build your project
     - Deploy to production
     - Give you a URL (e.g., `psychpedia.vercel.app`)

### Auto-Deployment

Once connected, Vercel will automatically:
- ✅ Deploy every push to `main` branch
- ✅ Create preview deployments for pull requests
- ✅ Rebuild on every commit
- ✅ Show build logs and deployment status

### Custom Domain

To use your custom domain (`psychpedia.com`):
1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

## Option 2: Vercel CLI (Alternative)

If you prefer using the CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
cd psychpedia-landing-v2
vercel link

# Deploy
vercel --prod
```

## Option 3: GitHub Actions (Advanced)

If you want more control, you can use the GitHub Actions workflow included in `.github/workflows/vercel-deploy.yml`.

**Note**: You'll need to set up Vercel secrets in GitHub:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Get these from Vercel Dashboard → Settings → Tokens

## Troubleshooting

### Build Fails

If your build fails, check:
1. **Build logs** in Vercel dashboard
2. **Validation scripts** - The build runs `validate:all` which might fail
   - If validation is too strict for production, modify `package.json`:
     ```json
     "build": "next build"  // Remove validation for production
     ```

### Root Directory Issue

If Vercel can't find your Next.js app:
- Set **Root Directory** to `psychpedia-landing-v2` in Vercel project settings

### Environment Variables

If your app needs environment variables:
- Add them in Vercel Dashboard → Project Settings → Environment Variables
- They'll be available in both build and runtime

## Current Setup

- ✅ `vercel.json` - Configuration file created
- ✅ `.github/workflows/vercel-deploy.yml` - Optional GitHub Actions workflow
- ✅ Build command configured: `npm run build`
- ✅ Next.js framework auto-detected

## Next Steps

1. **Connect Vercel to GitHub** (Option 1 above)
2. **Test deployment** by pushing a commit:
   ```bash
   git add .
   git commit -m "Test auto-deployment"
   git push origin main
   ```
3. **Check Vercel dashboard** - You should see a new deployment
4. **Visit your site** - Changes will be live automatically!

## Benefits

- 🚀 **Instant deployments** - Every push goes live automatically
- 🔄 **Preview deployments** - Every PR gets a preview URL
- 📊 **Analytics** - Built-in performance monitoring
- 🔒 **HTTPS** - Automatic SSL certificates
- 🌍 **CDN** - Global content delivery
- 📈 **Scaling** - Automatic scaling for traffic spikes

