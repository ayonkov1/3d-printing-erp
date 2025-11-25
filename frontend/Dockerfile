### STAGE 1: Build ###
# Use a Node.js image to build the React app
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Build the application for production
RUN npm run build

### STAGE 2: Serve ###
# Use a lightweight Nginx image to serve the static files
FROM nginx:1.25-alpine

# Copy the built static files from the build stage to the Nginx public html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for incoming traffic
EXPOSE 80

# The default Nginx command will start the server
CMD ["nginx", "-g", "daemon off;"]