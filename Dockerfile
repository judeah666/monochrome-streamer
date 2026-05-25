FROM node:24-alpine

ARG APP_VERSION=0.1.0
LABEL org.opencontainers.image.title="monochrome-streamer" \
  org.opencontainers.image.description="A self-hosted music streamer for local server files." \
  org.opencontainers.image.version="${APP_VERSION}" \
  org.opencontainers.image.source="https://github.com/judeah666/monochrome-streamer"

WORKDIR /app

COPY package*.json ./
RUN apk add --no-cache ca-certificates su-exec \
  && npm install

COPY server.mjs ./
COPY artist-info.example.json ./
COPY lib ./lib
COPY public ./public
COPY src ./src
COPY vite.config.js ./
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN npm run build \
  && npm prune --omit=dev \
  && chmod +x ./docker-entrypoint.sh

ENV HOST=0.0.0.0
ENV PORT=8888
ENV MUSIC_LIBRARY_PATH=/music
ENV ARTIST_INFO_PATH=artist-info.json
ENV DATA_DIR=/data
ENV LIBRARY_DATABASE_PATH=/data/library.sqlite
ENV COVER_CACHE_PATH=/data/covers
ENV SCAN_METADATA=tags
ENV SCAN_DURATIONS=false
ENV AUTO_SCAN_ON_START=false
ENV PUID=1000
ENV PGID=1000
ENV UMASK=022

EXPOSE 8888

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:8888/api/config').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.mjs"]
