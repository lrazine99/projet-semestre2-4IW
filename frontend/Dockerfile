FROM node:latest AS builder

# automatically creates the dir and sets it as the current working dir
WORKDIR /app
# this will allow us to run vite and other tools directly
# ENV PATH /usr/src/node_modules/.bin:$PATH

# inject all environment vars we'll need
# ARG VITE_BACKEND_URL
# expose the variable to the finished container
# ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

COPY package.json ./

RUN npm install

# use a more specific COPY, as this will include files like `Dockerfile`, we don't really need inside our containers.
COPY . .

FROM builder AS dev
CMD ["npm", "run", "dev", "--", "--host"]

FROM builder AS prod-builder
RUN npm run build

# it's a good idea to pin this, but for demo purposes we'll leave it as is
FROM nginx:latest AS prod

COPY --from=prod-builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]