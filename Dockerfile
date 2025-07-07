# ---------- Builder ----------
    FROM node:20-slim AS builder

    # build-essential for native add-ons
    RUN apt-get update && apt-get install -y --no-install-recommends \
          build-essential python3 && \
        rm -rf /var/lib/apt/lists/*
    
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    
    COPY tsconfig*.json ./
    COPY src ./src
    RUN npm run build            # tsc && tsc-alias
    
    # ---------- Runtime ----------
    FROM node:20-slim
    WORKDIR /app
    
    COPY --from=builder /app/dist ./dist
    COPY package*.json ./
    COPY --from=builder /app/node_modules ./node_modules
    RUN npm prune --omit=dev
    
    USER node
    EXPOSE 3000
    CMD ["node", "dist/main.js"]
    