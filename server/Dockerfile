FROM node:22-slim

WORKDIR /app/server

COPY server/package.json server/package-lock.json* ./
RUN npm install --production

COPY server/ .
COPY docs/ /app/docs/

EXPOSE 3001

CMD ["node", "index.js"]
