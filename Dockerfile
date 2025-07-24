# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Prune development dependencies
RUN npm prune --production

# Stage 2: Create the final production image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy the pruned node_modules and compiled code from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose the port the server will run on
EXPOSE 8049

# Define the command to run the compiled application
CMD [ "node", "dist/index.js" ]
