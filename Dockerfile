# Step 1: Base image for dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Step 2: Build the Next.js app
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Optional: Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Step 3: Create production image
FROM node:18-alpine AS runner
WORKDIR /app

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