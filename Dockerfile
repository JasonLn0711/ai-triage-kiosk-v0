FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY api ./api
COPY data ./data
COPY demo ./demo
COPY handoff/api-examples ./handoff/api-examples
COPY scripts ./scripts

ENV NODE_ENV=production
ENV PORT=4193

RUN node scripts/build_vector_index.js

EXPOSE 4193

CMD ["node", "scripts/mock-api-server.js"]
