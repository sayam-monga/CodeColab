FROM node:21.7.3

WORKDIR /app


# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY tsup.config.ts ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Create non-root user
RUN useradd -ms /bin/bash apiuser
RUN chown -R apiuser:apiuser /app
USER apiuser

EXPOSE 5001

CMD ["npm", "start"]