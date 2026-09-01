FROM node:20-alpine AS builder
WORKDIR /app/mfe-dashboard
COPY mfe-dashboard/package.json ./
RUN npm install --silent --include=dev
COPY shared/ ../shared
COPY mfe-dashboard/ ./
ARG NX_API_URL=http://localhost:8000
ENV NX_API_URL=$NX_API_URL
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache wget
COPY --from=builder /app/mfe-dashboard/dist /usr/share/nginx/html
COPY mfe-dashboard/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
