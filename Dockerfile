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
ENV ARTIST_OVERRIDES_PATH=/data/artist-overrides.json
ENV ALBUM_OVERRIDES_PATH=/data/album-overrides.json
ENV LYRICS_OVERRIDES_PATH=/data/lyrics-overrides.json
ENV LYRICS_SIDECAR_PATH=/data/lyrics

EXPOSE 8888

CMD ["node", "server.mjs"]
