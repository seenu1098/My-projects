# STEP 1 build static website
FROM node:12-alpine as builder
RUN apk update && apk add --no-cache make git
# Create app directory
WORKDIR /app
# Install app dependencies
COPY package.json package-lock.json  /app/
RUN cd /app && npm set progress=false && npm install
# Copy project files into the docker image
COPY .  /app
RUN cd /app && npm run prodbuild

# STEP 2 build a small nginx image with static website
FROM nginx:alpine
## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

RUN sed -i "/#error_page/c\    error_page   404    /index.html;" /etc/nginx/conf.d/default.conf

## From 'builder' copy website to default nginx public folder
COPY --from=builder /app/dist/livetester-ui /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]