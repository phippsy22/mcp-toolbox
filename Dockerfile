# Use a recent, stable version of Node
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Expose the port the server will run on
EXPOSE 8049

# Define the command to run the compiled application
CMD [ "node", "dist/index.js" ]
