# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

ARG PORT

################################################################################
# Use node image for base image for all stages.
FROM node:24-alpine AS base

# Set working directory for all build stages.
WORKDIR /usr/src/app

################################################################################
# Create a stage for installing production dependecies.
FROM base AS build

# Copy prisma schema and config for prisma generate (runs via postinstall)
COPY prisma ./prisma
COPY prisma.config.ts ./

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage bind mounts to package.json and package-lock.json to avoid having to copy them
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Copy the rest of the source files into the image.
COPY . .

# Run the build script.
RUN npm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base AS production

# Use production node environment by default.
ENV NODE_ENV=production

# Copy package.json so that package manager commands can be used.
COPY package.json ./

# Copy open API documentation.
COPY doc ./doc

# Copy prisma schema and config for migrate deploy
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --omit=dev

# Copy the built application (includes compiled prisma client in dist/generated).
COPY --from=build /usr/src/app/dist ./dist

# Create logs directory writable by node user.
RUN mkdir -p logs && chown node:node logs

# Expose the port that the application listens on.
EXPOSE $PORT

# Run the application as a non-root user.
USER node

# Apply migrations and run the application.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
