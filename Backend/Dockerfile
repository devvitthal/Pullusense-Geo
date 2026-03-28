# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copy Gradle wrapper and dependency manifests first (layer-cache friendly)
COPY gradlew gradlew.bat settings.gradle build.gradle ./
COPY gradle ./gradle

# Pre-fetch dependencies so rebuilds on source-only changes are fast
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon -q

# Copy source and build the fat jar (skip tests – run them in CI instead)
COPY src ./src
RUN ./gradlew bootJar --no-daemon -x test

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

# Non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

WORKDIR /app

# Copy only the built jar from the build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose the port Spring Boot listens on (overridable via PORT env var)
EXPOSE 8080

# Use exec form to receive OS signals properly (graceful shutdown)
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
