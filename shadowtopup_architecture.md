# ShadowTopUp System Architecture Blueprint

## 1. Project Directory Layout

```
shadowtopup/
├── backend/
│   ├── config/
│   │   └── index.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── garena.js
│   │   └── health.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   ├── .env.example
│   ├── package.json
│   ├── postcss.config.mjs
│   └── tsconfig.json
├── supabase/
│   └── schema.sql
├── .gitignore
└── shadowtopup_architecture.md
```

## 2. Technology Stack & Deployment

- **Frontend**: Next.js 15 (App Router, React 19, Tailwind CSS, TypeScript) -> Deployed on **Vercel**
- **Database & Auth**: Supabase PostgreSQL & Supabase Auth -> Deployed on **Supabase Free Tier**
- **Receipt Uploads**: ImgBB Free Storage API -> 100% Free Image Hosting
- **Scraper Microservice**: Node.js Express + Puppeteer-Extra Stealth -> Deployed on **Render.com**
