def supportedBranches() {
  ['main', 'dev', 'ci-cd-pipeline']
}

def normalizeBranchName(String branchName) {
  if (!branchName) {
    return ''
  }

  branchName
    .replaceFirst(/^refs\/heads\//, '')
    .replaceFirst(/^origin\//, '')
    .trim()
}

def resolvedBranchName() {
  normalizeBranchName(env.BRANCH_NAME ?: env.GIT_LOCAL_BRANCH ?: env.GIT_BRANCH ?: '')
}

def resolvedChangeTarget() {
  normalizeBranchName(env.CHANGE_TARGET ?: '')
}

def isSupportedBranchBuild() {
  def allowedBranches = supportedBranches()
  def branchName = resolvedBranchName()
  def changeTarget = resolvedChangeTarget()

  allowedBranches.contains(branchName) || (changeTarget && allowedBranches.contains(changeTarget))
}

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
        expression {
          !isSupportedBranchBuild()
        }
      }
      steps {
        echo "Jenkins CI is configured to run only for ${supportedBranches().join(', ')} branches. Resolved branch: '${resolvedBranchName()}', change target: '${resolvedChangeTarget()}'."
      }
    }

    stage('Backend Test & Build') {
      when {
        expression {
          isSupportedBranchBuild()
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
        expression {
          isSupportedBranchBuild()
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



