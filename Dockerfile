FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html

# Clean default nginx content
RUN rm -rf ./*

# Copy repository into image
COPY . /usr/share/nginx/html

# Remove files/folders you requested not to include in the image
RUN rm -f /usr/share/nginx/html/package.json /usr/share/nginx/html/Dockerfile && \
  rm -rf /usr/share/nginx/html/.github /usr/share/nginx/html/.gitattributes /usr/share/nginx/html/.gitignore /usr/share/nginx/html/.git /usr/share/nginx/html/.claude /usr/share/nginx/html/.cursor /usr/share/nginx/html/logs /usr/share/nginx/html/tests

# Optional: set safe permissions for nginx
RUN chown -R nginx:nginx /usr/share/nginx/html || true

EXPOSE 80
STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]