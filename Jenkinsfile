pipeline {
  agent any

  options {
    skipDefaultCheckout(true)
    timestamps()
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Unsupported Branch') {
      when {
        not {
          anyOf {
            branch 'main'
            branch 'dev'
            branch 'ci-cd-pipeline'
            changeRequest target: 'main'
            changeRequest target: 'dev'
            changeRequest target: 'ci-cd-pipeline'
          }
        }
      }
      steps {
        echo 'Jenkins CI is configured to run only for main and dev branches.'
      }
    }

    stage('Backend Test & Build') {
      when {
        anyOf {
          branch 'main'
          branch 'dev'
          branch 'ci-cd-pipeline'
          changeRequest target: 'main'
          changeRequest target: 'dev'
          changeRequest target: 'ci-cd-pipeline'
        }
      }
      steps {
        script {
          if (isUnix()) {
            sh 'chmod +x Backend/TransactionMonitoring/mvnw'
            dir('Backend/TransactionMonitoring') {
              sh './mvnw test'
              sh './mvnw package -DskipTests'
            }
          } else {
            dir('Backend/TransactionMonitoring') {
              bat 'mvnw.cmd test'
              bat 'mvnw.cmd package -DskipTests'
            }
          }
        }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'Backend/TransactionMonitoring/target/surefire-reports/*.xml'
          archiveArtifacts allowEmptyArchive: true, artifacts: 'Backend/TransactionMonitoring/target/*.jar'
        }
      }
    }

    stage('Frontend Test & Build') {
      when {
        anyOf {
          branch 'main'
          branch 'dev'
          branch 'ci-cd-pipeline'
          changeRequest target: 'main'
          changeRequest target: 'dev'
          changeRequest target: 'ci-cd-pipeline'
        }
      }
      steps {
        dir('Frontend') {
          script {
            if (isUnix()) {
              sh 'npm ci'
              sh 'npm test'
              sh 'npm run build'
            } else {
              bat 'npm ci'
              bat 'npm test'
              bat 'npm run build'
            }
          }
        }
      }
      post {
        success {
          archiveArtifacts allowEmptyArchive: true, artifacts: 'Frontend/dist/**'
        }
      }
    }
  }

  post {
    always {
      cleanWs deleteDirs: true, disableDeferredWipeout: true
    }
  }
}



