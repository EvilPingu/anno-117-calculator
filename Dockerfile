# Build stage: use Node 20 LTS to install deps and produce the production bundle
FROM node:20-alpine AS build
WORKDIR /app

# Copy package metadata first for dependency install
COPY package*.json ./

# If a lockfile exists, use `npm ci`; otherwise fall back to `npm install`
RUN if [ -f package-lock.json ]; then \
  npm ci --prefer-offline --no-audit --progress=false; \
  else \
  npm install --prefer-offline --no-audit --progress=false; \
  fi

# Copy source and build. Adjust build script and output dir if needed.
COPY . .
RUN npm run build --if-present

# Final stage: serve with nginx
FROM nginx:stable-alpine AS runtime
# Replace nginx default content; ensure nginx serves from /usr/share/nginx/html
ARG DIST_DIR=dist
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/${DIST_DIR} /usr/share/nginx/html

EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]