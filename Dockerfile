FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY src ./src
COPY public ./public
COPY data ./data

RUN chown -R node:node /app
USER node

ENV NODE_ENV=production \
    PORT=5000 \
    DATA_FILE=/app/data/courses.json

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]
