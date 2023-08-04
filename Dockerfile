FROM node:18-slim

WORKDIR /app
EXPOSE 3000

COPY . .

RUN npm ci
RUN npm run build
CMD ["node", "./build", "--port", "3000"]
