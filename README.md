# Psychpedia Landing Page v2

A modern, minimalist, medical-grade landing page built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** with custom design system
- **Bilingual support** (English/Arabic) with next-intl
- **RTL support** for Arabic
- **Accessible** with proper ARIA labels and keyboard navigation
- **SEO optimized** with proper meta tags and language alternates
- **Mobile-first** responsive design

## Design Philosophy

- Minimalist and academic aesthetic
- Calm color palette (off-whites, slate, muted blue)
- No gradients or heavy animations
- Generous white space
- Professional, evidence-based tone
- Inspired by Apple Health, Notion, and academic journals

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will automatically redirect to `/en` or `/ar` based on your browser's language preference.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Project Structure

```
psychpedia-landing-v2/
├── app/
│   ├── [locale]/          # Locale-specific routes
│   │   ├── layout.tsx     # Locale layout with i18n provider
│   │   └── page.tsx       # Main landing page
│   ├── layout.tsx          # Root HTML structure
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── Credibility.tsx
│   ├── Vision.tsx
│   ├── Waitlist.tsx
│   ├── Ethics.tsx
│   └── Footer.tsx
├── lib/
│   └── i18n/              # Internationalization
│       ├── config.ts      # next-intl configuration
│       └── messages/      # Translation files
│           ├── en.json
│           └── ar.json
├── middleware.ts          # Locale detection and routing
└── tailwind.config.ts    # Tailwind configuration
```

## Waitlist Form

The waitlist form submits to `/cgi-bin/waitlist.py` (existing backend). For this to work:

1. **Development**: You may need to proxy requests or use a mock handler
2. **Production**: Deploy the CGI script alongside the Next.js app, or configure your server to handle the route

The form includes:
- Client-side email validation
- Error handling
- Success/error states
- Accessibility features

## Internationalization

The app supports English (`/en`) and Arabic (`/ar`). Language switching is handled via the header toggle.

Translation files are located in `lib/i18n/messages/`:
- `en.json` - English translations
- `ar.json` - Arabic translations

### Verification

To verify that the HTML lang and dir attributes are set correctly server-side:

```bash
# Check Arabic locale
curl -s http://localhost:3000/ar | head -n 2
# Expected: <html lang="ar" dir="rtl">

# Check English locale
curl -s http://localhost:3000/en | head -n 2
# Expected: <html lang="en" dir="ltr">
```

The locale is inferred from the URL path and set via a cookie in middleware, ensuring correct server-side rendering without client-side hacks.

## Styling

Tailwind CSS is configured with a custom design system:

- **Colors**: Calm palette with off-whites, slate grays, and muted blue
- **Typography**: System fonts with Arabic fallbacks
- **Spacing**: Generous vertical spacing (6rem desktop, 4rem mobile)
- **RTL**: Automatic RTL support for Arabic via Tailwind utilities

## Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus states on all interactive elements
- Screen reader friendly

## SEO

- Proper meta tags with language alternates
- Open Graph tags
- Twitter Card tags
- Clean, descriptive titles and descriptions
- Canonical URLs

## Browser Support

- Modern browsers (last 2 versions)
- Graceful degradation for older browsers
- RTL support tested in Arabic browsers

## Deployment

This is a Next.js application and can be deployed to:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Any Node.js hosting** that supports Next.js

For the waitlist form to work, ensure the CGI script (`/cgi-bin/waitlist.py`) is accessible at the same domain or configure appropriate proxying.

## License

© 2026 Psychpedia. All rights reserved.
