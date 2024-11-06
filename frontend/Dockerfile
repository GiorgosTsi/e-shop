# Use nginx as the base image
FROM nginx:alpine

# Copy your frontend build files to the nginx html directory
COPY . /usr/share/nginx/html

# Expose the default nginx port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
