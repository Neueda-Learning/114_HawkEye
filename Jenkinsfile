pipeline {

    agent any

    environment {
        GIT_URL      = 'https://github.com/Neueda-Learning/114_HawkEye'
        BRANCH       = 'dev'
        COMPOSE_FILE = 'deploy/docker-compose.app.yml'
    }

    stages {

        stage('Checkout Source') {
            steps {
                git branch: "${BRANCH}",
                    url: "${GIT_URL}"
            }
        }

        stage('Build Docker Images') {
            steps {
                sh "docker compose -f ${COMPOSE_FILE} build --no-cache"
            }
        }

        stage('Stop Existing Containers') {
            steps {
                sh "docker compose -f ${COMPOSE_FILE} down --remove-orphans || true"
            }
        }

        stage('Deploy') {
            steps {
                sh "docker compose -f ${COMPOSE_FILE} up -d"
            }
        }

        stage('Verify') {
            steps {
                sh 'sleep 15'
                sh 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
            }
        }
    }
}
