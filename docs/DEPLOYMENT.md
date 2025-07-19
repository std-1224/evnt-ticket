# EVENTA - Guía de Deployment

Esta guía cubre el proceso completo de deployment de la aplicación EVENTA en diferentes entornos.

## 📋 Prerrequisitos

### Desarrollo Local
- Node.js 18+ 
- npm/yarn/pnpm
- Git

### Producción
- Cuenta en Vercel (recomendado)
- Base de datos PostgreSQL
- Servicio de almacenamiento de archivos (AWS S3, Cloudinary)
- Procesador de pagos (Stripe, PayPal)

## 🚀 Deployment en Vercel (Recomendado)

### 1. Preparación del Proyecto

\`\`\`bash
# Clonar el repositorio
git clone <repository-url>
cd eventa-app

# Instalar dependencias
npm install

# Verificar que el build funciona
npm run build
\`\`\`

### 2. Configuración de Variables de Entorno

Crear archivo `.env.local` para desarrollo:

\`\`\`env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=EVENTA

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/eventa_db

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=eventa-uploads
AWS_REGION=us-east-1

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-key
\`\`\`

### 3. Deployment en Vercel

#### Opción A: Desde GitHub (Recomendado)

1. **Conectar Repositorio**
   - Ir a [vercel.com](https://vercel.com)
   - Hacer clic en "New Project"
   - Importar desde GitHub

2. **Configurar Variables de Entorno**
   \`\`\`bash
   # En el dashboard de Vercel, ir a Settings > Environment Variables
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=your-production-secret
   # ... resto de variables
   \`\`\`

3. **Deploy Automático**
   - Cada push a `main` desplegará automáticamente
   - Preview deployments para pull requests

#### Opción B: Desde CLI

\`\`\`bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
\`\`\`

### 4. Configuración de Dominio Personalizado

\`\`\`bash
# Añadir dominio personalizado
vercel domains add your-domain.com

# Configurar DNS
# A record: @ -> 76.76.19.19
# CNAME record: www -> cname.vercel-dns.com
\`\`\`

## 🐳 Deployment con Docker

### 1. Dockerfile

\`\`\`dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
\`\`\`

### 2. Docker Compose

\`\`\`yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/eventa_db
      - NEXTAUTH_SECRET=your-secret-key
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: eventa_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
\`\`\`

### 3. Comandos de Docker

\`\`\`bash
# Build y run
docker-compose up --build

# Solo build
docker build -t eventa-app .

# Run en producción
docker run -p 3000:3000 eventa-app
\`\`\`

## ☁️ Deployment en AWS

### 1. AWS Amplify

\`\`\`bash
# Instalar Amplify CLI
npm install -g @aws-amplify/cli

# Configurar
amplify configure

# Inicializar proyecto
amplify init

# Añadir hosting
amplify add hosting

# Deploy
amplify publish
\`\`\`

### 2. AWS ECS con Fargate

\`\`\`yaml
# task-definition.json
{
  "family": "eventa-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "eventa-app",
      "image": "your-account.dkr.ecr.region.amazonaws.com/eventa-app:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:eventa/database-url"
        }
      ]
    }
  ]
}
\`\`\`

## 🗄️ Configuración de Base de Datos

### PostgreSQL en Supabase

\`\`\`bash
# 1. Crear proyecto en supabase.com
# 2. Obtener connection string
# 3. Ejecutar migraciones

# Connection string format:
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
\`\`\`

### PostgreSQL en Railway

\`\`\`bash
# 1. Crear cuenta en railway.app
# 2. Crear nuevo proyecto PostgreSQL
# 3. Obtener variables de conexión

# Variables automáticas:
DATABASE_URL=postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway
\`\`\`

### Migraciones de Base de Datos

\`\`\`bash
# Usando Prisma (opcional)
npx prisma migrate deploy

# O ejecutar SQL directamente
psql $DATABASE_URL -f database/schema.sql
psql $DATABASE_URL -f database/seed.sql
\`\`\`

## 📧 Configuración de Email

### SendGrid

\`\`\`env
SENDGRID_API_KEY=SG.your-api-key
SENDGRID_FROM_EMAIL=noreply@your-domain.com
\`\`\`

### AWS SES

\`\`\`env
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=your-access-key
AWS_SES_SECRET_ACCESS_KEY=your-secret-key
SES_FROM_EMAIL=noreply@your-domain.com
\`\`\`

## 💳 Configuración de Pagos

### Stripe

\`\`\`env
# Producción
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Configurar webhook endpoint:
# https://your-domain.com/api/webhooks/stripe
\`\`\`

### PayPal

\`\`\`env
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
PAYPAL_MODE=live # o 'sandbox' para testing
\`\`\`

## 📊 Monitoreo y Analytics

### Vercel Analytics

\`\`\`bash
npm install @vercel/analytics

# En _app.tsx
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
\`\`\`

### Sentry para Error Tracking

\`\`\`bash
npm install @sentry/nextjs

# sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
\`\`\`

## 🔒 Seguridad

### Headers de Seguridad

\`\`\`javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
\`\`\`

### Rate Limiting

\`\`\`javascript
// middleware.js
import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(request) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  return NextResponse.next()
}
\`\`\`

## 🧪 Testing en Producción

### Health Check Endpoint

\`\`\`javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  })
}
\`\`\`

### Smoke Tests

\`\`\`bash
# Crear script de smoke tests
#!/bin/bash
echo "Running smoke tests..."

# Test health endpoint
curl -f https://your-domain.com/api/health || exit 1

# Test main pages
curl -f https://your-domain.com/ || exit 1
curl -f https://your-domain.com/event || exit 1

echo "All smoke tests passed!"
\`\`\`

## 📈 Performance Optimization

### Next.js Optimizations

\`\`\`javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
  },
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
}
\`\`\`

### CDN Configuration

\`\`\`javascript
// Para assets estáticos
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.your-domain.com' 
    : '',
})
\`\`\`

## 🔄 CI/CD Pipeline

### GitHub Actions

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
\`\`\`

## 🚨 Rollback Strategy

### Vercel Rollback

\`\`\`bash
# Listar deployments
vercel ls

# Rollback a deployment anterior
vercel rollback [deployment-url]
\`\`\`

### Docker Rollback

\`\`\`bash
# Tag anterior
docker tag eventa-app:latest eventa-app:backup

# Deploy nueva versión
docker build -t eventa-app:latest .

# Si hay problemas, rollback
docker tag eventa-app:backup eventa-app:latest
docker-compose up -d
\`\`\`

## 📋 Checklist de Deployment

### Pre-deployment
- [ ] Tests pasando
- [ ] Build exitoso
- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] SSL certificado configurado
- [ ] DNS configurado

### Post-deployment
- [ ] Health check pasando
- [ ] Smoke tests exitosos
- [ ] Monitoreo configurado
- [ ] Logs funcionando
- [ ] Backup configurado
- [ ] Performance verificado

## 🆘 Troubleshooting

### Problemas Comunes

**Build Failures:**
\`\`\`bash
# Limpiar cache
npm run clean
rm -rf .next node_modules
npm install
npm run build
\`\`\`

**Database Connection:**
\`\`\`bash
# Verificar conexión
psql $DATABASE_URL -c "SELECT 1;"

# Verificar migraciones
psql $DATABASE_URL -c "\dt"
\`\`\`

**Environment Variables:**
\`\`\`bash
# Verificar variables en Vercel
vercel env ls

# Añadir variable
vercel env add VARIABLE_NAME
\`\`\`

## 📞 Soporte

Para problemas de deployment:
- **Email**: devops@eventa-app.com
- **Slack**: #deployment-support
- **Docs**: https://docs.eventa-app.com/deployment

---

**¡Deployment exitoso! 🚀**
