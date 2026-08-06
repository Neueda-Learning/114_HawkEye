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
    .replaceFirst(/^\*\//, '')
    .trim()
}

def configuredScmBranchName() {
  try {
    normalizeBranchName(scm?.branches?.getAt(0)?.name ?: '')
  } catch (ignored) {
    ''
  }
}

def resolvedBranchName() {
  [
    env.BRANCH_NAME,
    env.GIT_LOCAL_BRANCH,
    env.GIT_BRANCH,
    configuredScmBranchName(),
  ].collect { normalizeBranchName(it ?: '') }.find { it } ?: ''
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

  triggers {
    pollSCM('H/5 * * * *')
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
        echo "Jenkins CI is configured to run only for ${supportedBranches().join(', ')} branches. Resolved branch: '${resolvedBranchName()}', change target: '${resolvedChangeTarget()}', SCM branch: '${configuredScmBranchName()}'."
      }
    }

    stage('Backend Build') {
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
              sh './mvnw package -DskipTests'
            }
          } else {
            dir('Backend/TransactionMonitoring') {
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

    stage('Frontend Build') {
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
              sh 'npm run build'
            } else {
              bat 'npm ci'
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



