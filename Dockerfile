FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
