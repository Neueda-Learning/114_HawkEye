# Jenkins setup for HawkEye

## Files
- `Jenkinsfile` - pipeline definition
- `jenkins/Dockerfile` - custom Jenkins image with Git and Node.js 20
- `jenkins/plugins.txt` - Jenkins plugins to preinstall
- `jenkins/casc.yaml` - Jenkins Configuration as Code
- `jenkins/docker-compose.yml` - local Jenkins bootstrap with JCasC

## Start Jenkins with Docker
From the repo root:

```powershell
cd jenkins
docker compose up -d
```

Jenkins URL:
- `http://localhost:8081`

Default admin from `docker-compose.yml` / `casc.yaml`:
- Username: `admin`
- Password: `admin123!ChangeMe`

## What Jenkins runs
### Backend
- folder: `Backend/TransactionMonitoring`
- command: `./mvnw test`
- command: `./mvnw package -DskipTests`

### Frontend
- folder: `Frontend`
- command: `npm ci`
- command: `npm test`
- command: `npm run build`

## Jenkins UI steps after startup
1. Open `http://localhost:8081`
2. Log in with the admin user from the environment values
3. Create a new item
4. Select `Multibranch Pipeline`
5. Set the repository URL to your HawkEye Git repository
6. Add Git credentials only if your repo is private
7. In Branch Sources, keep Git/GitHub source and scan the repository
8. In Behaviors or filters, keep only branches `main`, `dev`, and `ci-cd-pipeline`
9. Ensure Script Path is `Jenkinsfile`
10. Save
11. Click `Scan Repository Now`

## If you do not use Docker
Install on the Jenkins node:
- Git
- Java 17
- Node.js 20

Then install plugins listed in `jenkins/plugins.txt` and load `jenkins/casc.yaml` with Configuration as Code.



