FROM node:20-alpine AS builder
WORKDIR /app/host
COPY host/package.json host/package-lock.json* ./
RUN npm install --silent --include=dev
COPY shared/ ../shared
COPY host/ ./
ARG MFE_CHAT_URL=http://localhost:3001/remoteEntry.js
ARG MFE_DASHBOARD_URL=http://localhost:3002/remoteEntry.js
ARG NX_API_URL=http://localhost:8000
ENV MFE_CHAT_URL=$MFE_CHAT_URL MFE_DASHBOARD_URL=$MFE_DASHBOARD_URL NX_API_URL=$NX_API_URL
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache wget
COPY --from=builder /app/host/dist /usr/share/nginx/html
COPY host/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
