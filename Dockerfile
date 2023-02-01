# Dockerfile for dev
# Pull the base image
FROM node:16-alpine
# Set the working directory
WORKDIR /app
# Copy app dependencies to container
COPY ./package.json /app
COPY ./package-lock.json /app
# Install packages, will take a while because of React
RUN npm install
# Copy rest of app over
COPY . /app

EXPOSE 3000
# start dev server
CMD npm start