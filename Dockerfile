# Build stage: use Node 20 LTS to install deps and produce the production bundle
FROM node:20-alpine AS build
WORKDIR /app

# Install build dependencies (use package-lock or yarn.lock if present)
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --progress=false

# Copy source and build. Adjust build script and output dir if needed.
COPY . .
RUN npm run build --if-present

# Final stage: serve with nginx
FROM nginx:stable-alpine AS runtime
# Replace nginx default content; ensure nginx serves from /usr/share/nginx/html
ARG DIST_DIR=dist
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/${DIST_DIR} /usr/share/nginx/html

# Optional: expose port and run
EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]