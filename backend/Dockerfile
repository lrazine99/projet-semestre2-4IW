FROM node:latest as dev

# Set the working directory within the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the server will run on
EXPOSE ${SERVER_PORT}

# Command to run the application
CMD ["npm", "run", "dev"]

FROM base as production

ENV NODE_PATH=./build

RUN npm run build