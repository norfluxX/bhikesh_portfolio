FROM alpine:latest
#Test run
#Time for test2
RUN apk add --update nodejs npm
# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 3005

# Start the application
CMD ["node", "index.js"]

