# Deployment Guide

## Option 1: Vercel (Recommended for Next.js)

Vercel is the easiest way to deploy Next.js applications.

### Prerequisites
- Vercel account (free tier available)
- GitHub/GitLab/Bitbucket repository (optional, can deploy directly)

### Steps

1. **Install Vercel CLI** (optional, can also use web interface):
```bash
npm i -g vercel
```

2. **Deploy**:
```bash
cd psychpedia-landing-v2
vercel
```

3. **Follow the prompts**:
   - Link to existing project or create new
   - Confirm project settings
   - Deploy

4. **For production**:
```bash
vercel --prod
```

### Waitlist Form Backend

Since Vercel doesn't support CGI scripts, you have two options:

**Option A: Create a Next.js API Route** (Recommended)
- Create `app/api/waitlist/route.ts` to handle form submissions
- Can connect to your existing backend or implement directly

**Option B: Use External API**
- Deploy CGI script separately
- Update form to POST to external URL

---

## Option 2: Traditional Node.js Hosting

For hosting that supports both Next.js and CGI scripts (e.g., shared hosting with Node.js support).

### Steps

1. **Build the application**:
```bash
npm run build
```

2. **Upload files**:
   - Upload the entire project (excluding `node_modules`)
   - Or upload `.next` folder + `package.json` + other config files

3. **Install dependencies on server**:
```bash
npm install --production
```

4. **Start the server**:
```bash
npm start
```

5. **Use PM2 for process management** (recommended):
```bash
npm install -g pm2
pm2 start npm --name "psychpedia-landing" -- start
pm2 save
pm2 startup
```

### Server Requirements
- Node.js 18+
- Support for Next.js server
- Port 3000 (or configure via `PORT` environment variable)

---

## Option 3: Docker Deployment

### Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Update next.config.mjs for standalone output:

```javascript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/config.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For Docker
};

export default withNextIntl(nextConfig);
```

### Build and run:
```bash
docker build -t psychpedia-landing .
docker run -p 3000:3000 psychpedia-landing
```

---

## Environment Variables

If needed, create `.env.local` for local development or set in your hosting platform:

```env
# No environment variables required for basic setup
# Add any API keys or config here if needed later
```

---

## Waitlist Form - Next.js API Route Alternative

If you want to replace the CGI script with a Next.js API route, create:

**File: `app/api/waitlist/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // TODO: Save to database or external service
    // For now, return success
    // You can integrate with your existing backend here

    return NextResponse.json({
      success: true,
      message: "Thank you! You've been added to the waitlist."
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
```

Then update `components/Waitlist.tsx` to use `/api/waitlist` instead of `/cgi-bin/waitlist.py`.

---

## Post-Deployment Checklist

- [ ] Test both English and Arabic versions (`/en` and `/ar`)
- [ ] Verify language toggle works
- [ ] Test waitlist form submission
- [ ] Check mobile responsiveness
- [ ] Verify SEO meta tags
- [ ] Test RTL layout for Arabic
- [ ] Check all navigation links
- [ ] Verify accessibility (keyboard navigation, screen readers)

---

## Custom Domain Setup

### Vercel
1. Go to project settings → Domains
2. Add your domain (e.g., `psychpedia.com`)
3. Follow DNS configuration instructions

### Other Hosting
- Configure your domain's DNS to point to your server
- Set up SSL certificate (Let's Encrypt recommended)

---

## Troubleshooting

### Build Errors
- Ensure Node.js 18+ is installed
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors: `npm run build`

### Runtime Errors
- Check server logs
- Verify environment variables are set
- Ensure port 3000 (or configured port) is available

### Waitlist Form Not Working
- Check browser console for errors
- Verify API endpoint is accessible
- Check CORS settings if using external API

