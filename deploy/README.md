# HawkEye — Jenkins CI/CD Setup Guide

This document covers everything you need to get the Jenkins pipeline running
on a Linux EC2 instance from scratch. It is intentionally beginner-friendly.

---

## Project Structure Overview

```
HawkEye/
├── Backend/TransactionMonitoring/   ← Spring Boot (Java 17, Maven)
│   ├── Dockerfile                   ← Multi-stage: Maven build + JRE runtime
│   └── src/main/resources/
│       └── application.properties   ← Reads DB credentials from env vars
│
├── Frontend/                        ← React + TypeScript + Vite
│   ├── Dockerfile                   ← Multi-stage: Node build + nginx serve
│   └── nginx.conf                   ← Proxies /api/* → backend container
│
├── deploy/
│   ├── docker-compose.app.yml       ← Orchestrates all 3 containers
│   ├── .env                         ← Your real secrets (NOT in Git)
│   └── .env.example                 ← Template — copy this to create .env
│
└── Jenkinsfile                      ← 5-stage CI/CD pipeline
```

---

## How Services Communicate

```
Browser
  │
  ▼ :4173
┌─────────────────────┐
│  hawkeye-frontend   │  (nginx inside Docker)
│  React SPA          │
└──────────┬──────────┘
           │ /api/*  proxied to http://backend:8080
           ▼ :8080 (internal only)
┌─────────────────────┐
│  hawkeye-backend    │  (Spring Boot inside Docker)
│  Spring Boot API    │
└──────────┬──────────┘
           │ jdbc:mysql://mysql:3306/txnd
           ▼ :3306 (internal only)
┌─────────────────────┐
│  hawkeye-mysql      │  (MySQL 8)
└─────────────────────┘
```

**Key rule:** Services talk to each other using Docker **service names** (`mysql`, `backend`, `frontend`),
NOT `localhost`. The backend connects to `mysql:3306`, not `localhost:3306`.

---

## Part 1 — EC2 Server Setup

### 1.1 Install Docker

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
```

### 1.2 Give Jenkins User Docker Access

Without this step, Jenkins will get "Permission denied" when running `docker` commands.

```bash
# Add the jenkins user to the docker group
sudo usermod -aG docker jenkins

# Restart Jenkins to apply the group change
sudo systemctl restart jenkins
```

Verify it works by running this as the jenkins user:
```bash
sudo -u jenkins docker ps
```

If you see a table header (not a permission error), you're good.

---

## Part 2 — Jenkins Plugins Required

Install these via **Manage Jenkins → Plugins → Available plugins**:

| Plugin | Why it's needed |
|--------|-----------------|
| **Git** | Checkout code from Git repository |
| **Pipeline** | Enables `pipeline { }` Jenkinsfile syntax |
| **Workspace Cleanup** | `cleanWs()` in the `post` block |
| **Timestamper** | Adds timestamps to build logs |

These are almost always pre-installed. If a stage fails saying a step is not
found, check this list first.

---

## Part 3 — Jenkins Job Configuration

1. In Jenkins, click **New Item**
2. Enter a name (e.g., `hawkeye-pipeline`)
3. Select **Pipeline** → click **OK**
4. Scroll to **Pipeline** section:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: your Git repo URL
   - Branch: `*/main` (or `*/dev`, or `**` for all branches)
   - Script Path: `HawkEye/Jenkinsfile`
5. Click **Save**

### Add Git Credentials (if private repo)

1. Go to **Manage Jenkins → Credentials → Global → Add Credentials**
2. Kind: **Username with password** (or SSH key)
3. Fill in your Git username and password/token
4. Save, then select this credential in your pipeline job's SCM settings

---

## Part 4 — Environment File Setup

The `deploy/.env` file holds all secrets. Docker Compose reads it automatically
because it lives in the same directory as `docker-compose.app.yml`.

```bash
# On your EC2 server, navigate to the project
cd /var/lib/jenkins/workspace/hawkeye-pipeline/HawkEye/deploy

# Copy the template
cp .env.example .env

# Edit with your real values
nano .env
```

**Important:** The `deploy/.env` file is in `.gitignore` and will be wiped by
`cleanWs()` after each build. You have two options:

**Option A (Recommended):** Store secrets in Jenkins Credentials and write the
`.env` file at the start of the pipeline using a script step.

**Option B (Simpler):** Keep the `.env` file outside the workspace and copy it
in during the pipeline:
```groovy
// Add this to the Checkout stage in Jenkinsfile:
sh 'cp /home/ec2-user/hawkeye-secrets/.env deploy/.env'
```

---

## Part 5 — How Jenkins Connects to EC2

Since Jenkins **runs directly on the EC2 instance**, it executes `docker` and
`docker compose` commands locally. No SSH tunneling is needed.

If you want Jenkins on a **separate server** deploying to the EC2 instance, use
the **SSH Agent** plugin and add the EC2 SSH key as a credential.

---

## Part 6 — Pipeline Stages Explained

| Stage | What it does |
|-------|-------------|
| **Checkout** | Pulls latest code from Git |
| **Build Docker Images** | Builds `hawkeye-frontend` and `hawkeye-backend` images. React and Spring Boot compile INSIDE Docker — no npm or Maven needed on the host |
| **Stop Old Containers** | Runs `docker compose down` — removes old containers but keeps MySQL data volume |
| **Deploy** | Runs `docker compose up -d --build` — starts mysql → backend → frontend in order |
| **Verify** | Waits 15 seconds, then prints running containers to the build log |

---

## Part 7 — Verification Commands

After a successful pipeline run, SSH into your EC2 and run:

```bash
# See all running containers
docker ps

# Expected output should include:
# hawkeye-mysql    Up X minutes
# hawkeye-backend  Up X minutes
# hawkeye-frontend Up X minutes

# Check backend startup logs (look for "Started TransactionMonitoringApplication")
docker logs hawkeye-backend --tail 100

# Check frontend nginx is running
docker logs hawkeye-frontend --tail 20

# Check MySQL is ready
docker logs hawkeye-mysql --tail 30

# Inspect Docker network (all 3 containers should be listed)
docker network inspect hawkeye-net

# Test backend health endpoint
curl http://localhost:8082/actuator/health

# Test frontend is serving HTML
curl -I http://localhost:4173

# Test API through nginx proxy (tests the frontend → backend path)
curl http://localhost:4173/api/actuator/health
```

---

## Part 8 — Troubleshooting

### "Permission denied" when Jenkins runs docker
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Backend fails to connect to MySQL
- Check that MySQL container is healthy: `docker ps` — look for `(healthy)` status
- Check the `SPRING_DATASOURCE_URL` uses `mysql` (service name), not `localhost`
- Check `.env` file has correct MySQL credentials

### Frontend shows blank page
- Check browser console for errors
- Check nginx logs: `docker logs hawkeye-frontend`
- Verify the `/api` proxy in nginx.conf points to `http://backend:8080`

### "Port already in use" error
```bash
# Find what's using port 8082 or 4173
sudo lsof -i :8082
sudo lsof -i :4173
```

### MySQL data lost after redeploy
- Data is in the `hawkeye-mysql-data` Docker volume
- `docker compose down` does NOT delete volumes (data is safe)
- Only `docker compose down -v` deletes volumes — avoid this in production

---

## Application URLs

| Service | URL |
|---------|-----|
| Frontend | `http://<EC2-IP>:4173` |
| Backend API | `http://<EC2-IP>:8082` |
| Swagger UI | `http://<EC2-IP>:8082/swagger-ui.html` |
| Health check | `http://<EC2-IP>:8082/actuator/health` |

Remember to open ports **4173** and **8082** in your EC2 Security Group inbound rules.
