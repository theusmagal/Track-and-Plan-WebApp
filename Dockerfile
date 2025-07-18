# Use Node.js official image
FROM node:18

# Set working directory
WORKDIR /app

# Copy only package files first for caching
COPY server/package*.json ./server/

# Install server dependencies
RUN cd server && npm install

# Copy the rest of the code
COPY . .

# Generate Prisma client and push schema
RUN cd server && npx prisma generate && npx prisma db push

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "server/index.js"]
