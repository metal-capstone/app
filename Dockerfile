# Dockerfile
# Pull the base image
FROM node:16-alpine
# Set the working directory
WORKDIR /app
# Copy app dependencies to container
COPY ./package.json /app
COPY ./package-lock.json /app
# Add `/app/node_modules/.bin` to $PATH
#ENV PATH /app/node_modules/.bin:$PATH
# Install dependencies
RUN npm install

COPY . /app

EXPOSE 3000

CMD npm start