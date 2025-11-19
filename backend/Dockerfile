FROM node:18-alpine

WORKDIR /app

# Install docker-compose
RUN apk add --no-cache docker-cli docker-compose

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create customers directory
RUN mkdir -p /app/customers

EXPOSE 3000

CMD ["node", "server.js"]

