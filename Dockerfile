FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html

# Clean default nginx content
RUN rm -rf ./*

# Serve index.html, scripts and styles with Cache-Control: no-cache
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy repository into image (.dockerignore keeps .git, tests etc. out)
COPY --chown=nginx:nginx . /usr/share/nginx/html

EXPOSE 80
STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]
