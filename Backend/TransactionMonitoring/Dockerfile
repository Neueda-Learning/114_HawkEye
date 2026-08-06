# ============================================================
# Stage 1 — Build the Spring Boot application with Maven
# ============================================================
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy Maven wrapper and POM first for dependency caching
COPY .mvn .mvn
COPY mvnw pom.xml ./

# Make wrapper executable and download all dependencies
# This layer is cached unless pom.xml changes
RUN chmod +x mvnw && ./mvnw -q -DskipTests dependency:go-offline

# Copy application source code
COPY src src

# Build the fat JAR, skip tests (tests are not part of this pipeline)
RUN ./mvnw -DskipTests package

# ============================================================
# Stage 2 — Lightweight runtime image
# ============================================================
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy only the built JAR from the build stage
COPY --from=build /app/target/*.jar /app/app.jar

# Backend listens on port 8080
EXPOSE 8080

# Spring Boot reads SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME,
# SPRING_DATASOURCE_PASSWORD from environment variables automatically
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
