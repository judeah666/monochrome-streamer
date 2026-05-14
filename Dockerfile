FROM node:24-alpine

WORKDIR /app

COPY package.json ./
RUN apk add --no-cache ca-certificates \
  && npm install --omit=dev

COPY server.mjs ./
COPY artist-info.example.json ./
COPY lib ./lib
COPY public ./public

ENV HOST=0.0.0.0
ENV PORT=8888
ENV MUSIC_LIBRARY_PATH=/music
ENV ARTIST_INFO_PATH=artist-info.json
ENV DATA_DIR=/data
ENV SCAN_METADATA=tags
ENV SCAN_DURATIONS=false
ENV AUTO_SCAN_ON_START=false

EXPOSE 8888

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:8888/api/config').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.mjs"]
