FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Set permissions for scripts if needed
RUN chmod +x setup-google-services.sh || true

# Define environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV SA_KEY_PATH=/app/mailer-key.json

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]
