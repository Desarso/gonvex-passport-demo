FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_GONVEX_WS_URL=wss://gonvex-maker.whagons.com/ws
ARG VITE_GONVEX_URL=https://gonvex-maker.whagons.com
ARG VITE_GONVEX_PROJECT_ID=01f18080-1c94-610d-92da-9a050d5792a4

ENV VITE_GONVEX_WS_URL=$VITE_GONVEX_WS_URL
ENV VITE_GONVEX_URL=$VITE_GONVEX_URL
ENV VITE_GONVEX_PROJECT_ID=$VITE_GONVEX_PROJECT_ID

RUN npm run build

FROM nginx:1.31-alpine

RUN apk add --no-cache --upgrade 'libxslt>=1.1.43-r4'

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1/ || exit 1
