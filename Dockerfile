# Step 1: Base image for dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Step 2: Build the Next.js app
FROM node:18-alpine AS builder
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
WORKDIR /app

# Make the build-time env vars available to Next.js during `npm run build`
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Optional: Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Step 3: Create production image
FROM node:18-alpine AS runner
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
WORKDIR /app

# Persist the env vars at runtime as well
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY

ENV NODE_ENV=production

# Copy only necessary files
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

# Expose port
EXPOSE 3000

# Start Next.js app
CMD ["npm", "start"]