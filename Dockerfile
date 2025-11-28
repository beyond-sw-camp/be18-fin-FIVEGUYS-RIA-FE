# 1. Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2. Run Stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# 필요 시 커스텀 nginx.conf 복사
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
