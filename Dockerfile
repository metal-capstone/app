# Dockerfile for dev
# Pull the base image
FROM node:16-alpine
# Set the working directory
WORKDIR /app
# Copy app files
COPY . .
# ==== BUILD =====
# Install dependencies (npm ci makes sure the exact versions in the lockfile gets installed)
RUN npm ci 
# Build the app
RUN npm run build
# ==== RUN =======
EXPOSE 3000
# Start the app
CMD [ "npm", "run", "start" ]
