FROM node:latest AS base

# Set the working directory within the container
WORKDIR /app

COPY package*.json ./

RUN npm install

# Stage 2: developpement stage
FROM base AS dev

COPY . .

EXPOSE ${SERVER_PORT}

CMD ["npm", "run", "dev"]

# Stage 3: Production stage
FROM base AS prod

COPY . .

ENV NODE_PATH=./build

ENV NODE_ENV=production
ENV SERVER_PORT=3000
ENV STRIPE_KEY=sk_test_51Mv1BEGk0I9TXycsuPiiXCBfdWpsvmdZl8w8GyZqsamQx1uK2rG6r4HDNA2EzRZcHW9SKJozQ8m2vVep85GqMfr600LovocVGK
ENV MAILGUN_API_KEY=c44325aac7fc17c406fb386d8a1c8c26-c02fd0ba-f01a3168
ENV MAILGUN_DOMAIN=game-market-esgi-s2-4iw.world
ENV MAILGUN_PUBLIC_VALIDATION_URL=https://api.mailgun.net/v4/address/validate
ENV MONGODB_URI=mongodb://db:27017
ENV MONGODB_USERNAME=root
ENV MONGODB_PASSWORD=Inghe@55
ENV DATABASE_NAME=game-market
ENV PROD_PASS=ed€94@dDdd
ENV STRIPE_SECRET_KEY=sk_test_51Mv1BEGk0I9TXycsuPiiXCBfdWpsvmdZl8w8GyZqsamQx1uK2rG6r4HDNA2EzRZcHW9SKJozQ8m2vVep85GqMfr600LovocVGK

RUN npm run build

EXPOSE ${SERVER_PORT}

# Command to run the application in production mode
CMD ["npm", "run", "start"]