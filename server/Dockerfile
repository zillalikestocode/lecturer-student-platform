# Use the official Bun image as base
FROM oven/bun:latest

# Set working directory in the container
WORKDIR /app

# Copy package.json and bun.lock files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY . .

# Set environment variables for MongoDB and other configurations
# These can be overridden when running the container
ENV PORT=5000 
ENV MONGODB_URI=mongodb+srv://emmanuelngoka778:group4ges400@cluster0.84c2kog.mongodb.net/lecturer-student-platform?retryWrites=true&w=majority&appName=Cluster0
ENV JWT_SECRET=your-jwt-secret-here

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["bun", "index.ts"]