# Versions & args  
ARG NODE_VERSION=20-slim          
ARG DEBIAN_FRONTEND=noninteractive

# Dependencies     
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev               

# Build TypeScript 
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install    

COPY tsconfig*.json ./              
COPY src ./src
RUN npm run build                    

# Runtime image
FROM node:20-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    TRANSFORMERS_CACHE=/root/.cache/huggingface \
    USE_ONNXRUNTIME_NODE=0

# Install dumb-init for proper signal handling
RUN apt-get update && apt-get install -y dumb-init && rm -rf /var/lib/apt/lists/*

# Copy the production environment file
COPY .env.prod .env.prod

COPY --from=builder /app/dist         ./dist
COPY --from=deps    /app/node_modules ./node_modules

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/main.js"]