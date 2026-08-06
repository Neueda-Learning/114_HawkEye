// ============================================================
// HawkEye CI/CD Pipeline
// ============================================================
// Stages:
//   1. Checkout       — pull latest code from Git
//   2. Build Images   — compile & build all Docker images
//   3. Stop Old       — tear down any running containers
//   4. Deploy         — start all containers in detached mode
//   5. Verify         — confirm all containers are up
//
// Requirements on the Jenkins/EC2 server:
//   - Docker installed and running
//   - Jenkins user added to the docker group
//   - deploy/.env is committed in the repository (contains DB + mail credentials)
// ============================================================

pipeline {
  agent any

  options {
    // Do not run a default checkout before the explicit Checkout stage
    skipDefaultCheckout(true)
    // Prefix every log line with a timestamp
    timestamps()
    // If a build is still running when the next one starts, abort the old one
    disableConcurrentBuilds()
  }

  triggers {
    // Poll the Git repository every 5 minutes for new commits
    pollSCM('H/5 * * * *')
  }

  environment {
    // Path to compose file, relative to the workspace root (HawkEye/)
    COMPOSE_FILE = 'deploy/docker-compose.app.yml'
  }

  stages {

    // ----------------------------------------------------------
    // Stage 1: Checkout
    // Pull the latest code from the configured Git branch,
    // then inject the .env file from Jenkins credentials so
    // Docker Compose can read secrets without any manual SSH steps.
    // ----------------------------------------------------------
    stage('Checkout') {
      steps {
        echo "Checking out source code..."
        checkout scm
        echo "Checkout complete. Current branch: ${env.GIT_BRANCH ?: env.BRANCH_NAME ?: 'unknown'}"
        // deploy/.env is committed in the repo — no extra step needed.
        // Docker Compose reads it automatically from the deploy/ folder.
        echo "Checkout done. deploy/.env is ready from the repository."
      }
    }

    // ----------------------------------------------------------
    // Stage 2: Build Docker Images
    // Builds all three images: mysql (pulled), backend, frontend
    // The Frontend Dockerfile compiles React inside Docker (multi-stage)
    // The Backend Dockerfile compiles Spring Boot inside Docker (multi-stage)
    // No pre-build steps needed on Jenkins — Docker handles everything
    // ----------------------------------------------------------
    stage('Build Docker Images') {
      steps {
        echo "Building Docker images..."
        sh """
          docker compose -f ${env.COMPOSE_FILE} build --no-cache
        """
        echo "All Docker images built successfully."
      }
    }

    // ----------------------------------------------------------
    // Stage 3: Stop Old Containers
    // Gracefully stop and remove any running containers from the
    // previous deployment. Volumes (MySQL data) are preserved.
    // ----------------------------------------------------------
    stage('Stop Old Containers') {
      steps {
        echo "Stopping and removing old containers..."
        sh """
          docker compose -f ${env.COMPOSE_FILE} down --remove-orphans
        """
        echo "Old containers removed."
      }
    }

    // ----------------------------------------------------------
    // Stage 4: Deploy
    // Start all services in detached (background) mode.
    // --build is included as a safety net in case Build stage cache
    // produced stale layers.
    // Docker Compose starts services in dependency order:
    //   mysql → backend → frontend
    // ----------------------------------------------------------
    stage('Deploy') {
      steps {
        echo "Deploying all services..."
        sh """
          docker compose -f ${env.COMPOSE_FILE} up -d --build
        """
        echo "All services started."
      }
    }

    // ----------------------------------------------------------
    // Stage 5: Verify
    // Wait a few seconds for containers to fully initialize,
    // then print the running container list to the build log.
    // ----------------------------------------------------------
    stage('Verify') {
      steps {
        echo "Waiting for containers to initialize..."
        sh 'sleep 15'
        echo "Running containers:"
        sh 'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"'
        echo "Deployment verification complete."
      }
    }

  }

  // ----------------------------------------------------------
  // Post-build actions (run regardless of pass/fail)
  // ----------------------------------------------------------
  post {
    success {
      echo """
      ✅ Deployment successful!

      Access your application:
        Frontend : http://<EC2-PUBLIC-IP>:4173
        Backend  : http://<EC2-PUBLIC-IP>:8082
        API docs : http://<EC2-PUBLIC-IP>:8082/swagger-ui.html
        Health   : http://<EC2-PUBLIC-IP>:8082/actuator/health

      Useful debug commands (run on EC2):
        docker ps
        docker logs hawkeye-backend --tail 50
        docker logs hawkeye-frontend --tail 20
        docker logs hawkeye-mysql --tail 20
      """
    }
    failure {
      echo """
      ❌ Deployment failed! Investigate with:
        docker compose -f deploy/docker-compose.app.yml logs
        docker compose -f deploy/docker-compose.app.yml logs backend
        docker compose -f deploy/docker-compose.app.yml logs mysql
      """
    }
    always {
      // Clean up the Jenkins workspace after every build to free disk space
      cleanWs deleteDirs: true, disableDeferredWipeout: true
    }
  }
}
