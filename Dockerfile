# Install dependencies only when needed
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package.json and package-lock.json or yarn.lock
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js app
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary files for production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]