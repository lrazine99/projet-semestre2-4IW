# Build stage
FROM node:latest AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

# Production build
FROM builder as build-stage
RUN npm run build

# Production with Nginx
FROM nginx:stable-alpine as prod
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY --from=build-stage /app/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Development stage
FROM builder AS dev
CMD ["npm", "run", "dev", "--", "--host"]