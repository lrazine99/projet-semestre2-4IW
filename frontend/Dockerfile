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

COPY . .

RUN npm run build


FROM nginx:stable-alpine as prod

COPY --from=builder /app/dist /usr/share/nginx/html

COPY --from=builder /app/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

FROM builder AS dev

CMD ["npm", "run", "dev", "--", "--host"]
