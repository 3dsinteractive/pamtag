FROM node:18-alpine

WORKDIR /home/node/app
ADD . /home/node/app

RUN yarn
RUN yarn build


FROM nginx:1.20

WORKDIR /usr/share/nginx/html

RUN \
    apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY --from=0 /home/node/app/build/pamtracker.js /usr/share/nginx/html/script/
COPY --from=0 /home/node/app/pam4/pam4-tracker.umd.js /usr/share/nginx/html/script/