FROM node:20-alpine AS builder
WORKDIR /app
ARG MFE_CHAT_URL=http://localhost:3001/remoteEntry.js
ARG MFE_DASHBOARD_URL=http://localhost:3002/remoteEntry.js
ENV NODE_ENV=production
ENV MFE_CHAT_URL=$MFE_CHAT_URL
ENV MFE_DASHBOARD_URL=$MFE_DASHBOARD_URL
COPY package.json package-lock.json* ./
RUN npm ci --silent
COPY . .
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache wget
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
