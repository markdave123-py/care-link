#   ARG NODE_VERSION=20-slim
#   ARG DEBIAN_FRONTEND=noninteractive
  
#   FROM node:${NODE_VERSION} AS deps
#   WORKDIR /app
  
#   COPY package*.json ./
#   RUN --mount=type=cache,target=/root/.npm \
#       npm ci --omit=dev       # ⚠️  NO --omit=optional !
  

#   FROM node:${NODE_VERSION} AS builder
#   WORKDIR /app
  

#   RUN apt-get update && apt-get install -y --no-install-recommends \
#         build-essential python3 \
#         libvips libjpeg-turbo-progs libpng16-16 && \
#       rm -rf /var/lib/apt/lists/*
  
#   COPY --from=deps /app/node_modules ./node_modules
#   COPY package*.json ./
#   RUN --mount=type=cache,target=/root/.npm \
#       npm install            # dev-deps only
  
#   COPY tsconfig*.json ./
#   COPY src ./src
#   RUN npm run build          # tsc && tsc-alias
  

#   FROM gcr.io/distroless/nodejs20-debian12 AS runtime
#   WORKDIR /app
  
  

#   COPY --from=builder /usr/lib/*/libvips.so.*        /usr/lib/
#   COPY --from=builder /usr/lib/*/libjpeg.so.*        /usr/lib/
#   COPY --from=builder /usr/lib/*/libpng*.so.*        /usr/lib/
  
#   ENV NODE_ENV=production \
#       TRANSFORMERS_CACHE=/root/.cache/huggingface \
#       USE_ONNXRUNTIME_NODE=0
  
#   COPY --from=builder /app/dist         ./dist
#   COPY --from=deps    /app/node_modules ./node_modules
  
#   EXPOSE 3000
#   CMD ["dist/main.js"]
  

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
FROM gcr.io/distroless/nodejs20-debian12  AS runtime   
WORKDIR /app

ENV NODE_ENV=production \
    TRANSFORMERS_CACHE=/root/.cache/huggingface \
    USE_ONNXRUNTIME_NODE=0

COPY --from=builder /app/dist         ./dist
COPY --from=deps    /app/node_modules ./node_modules

EXPOSE 3000
CMD ["dist/main.js"]