FROM node:latest

WORKDIR /app

# Copy the source code
COPY . .

# Install dependencies
RUN npm install

# Convert line endings and make entrypoint executable
RUN sed -i 's/\r$//' /app/scripts/entrypoint.sh && chmod +x /app/scripts/entrypoint.sh

# Expose port
EXPOSE 5000

# Run script to create root user and start the app
CMD ["bash", "/app/scripts/entrypoint.sh"]