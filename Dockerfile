# 编译用依赖库
FROM node:alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
#RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 部署用依赖库 
FROM node:alpine  AS prod
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production

# 编译 
FROM node:alpine  AS builder
WORKDIR /app
COPY . .
COPY package.json yarn.lock ./
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build

# 打包镜像
FROM node:alpine  AS runner
WORKDIR /app

# You only need to copy next.config.js if you are NOT using the default configuration
# COPY --from=builder /app/next.config.js ./
#COPY --from=builder /app/public ./public

COPY --chown=node:node --from=builder /app/.next ./.next
COPY --chown=node:node --from=builder /app/build ./build
COPY --chown=node:node --from=prod /app/node_modules ./node_modules
COPY --chown=node:node --from=prod /app/package.json ./package.json
#RUN chown -R node:node /app/database
USER node
VOLUME [ "/app/database" ]
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "build/service/app.js"]