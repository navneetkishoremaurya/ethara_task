FROM node:20-alpine AS build

WORKDIR /app
COPY package.json /app/package.json

RUN npm install

COPY . /app
RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker-entrypoint.sh /docker-entrypoint.d/99-config.sh

RUN chmod +x /docker-entrypoint.d/99-config.sh

EXPOSE 80

