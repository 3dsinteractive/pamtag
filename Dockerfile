FROM nginx:1.20

RUN \
    apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY ./build/pamtracker.js /usr/share/nginx/html/script

WORKDIR /usr/share/nginx/html
