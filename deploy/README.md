# HawkEye Docker-based CD deployment

This deployment flow is designed for Jenkins running on the same Linux EC2 host as the application.

## What gets deployed
- Backend container -> `hawkeye-backend`
- Frontend container -> `hawkeye-frontend`
- Frontend served by nginx in the frontend container on port `4173`
- Frontend `/api/*` calls are proxied to the backend container

## Files used
- `Backend/TransactionMonitoring/Dockerfile`
- `Frontend/Dockerfile`
- `deploy/nginx/default.conf`
- `deploy/docker-compose.app.yml`
- `deploy/deploy_backend.sh`
- `deploy/deploy_frontend.sh`

## Jenkins behavior
The root `Jenkinsfile` on branch `dev` will:
1. build backend with Maven, skipping tests
2. build frontend with Vite, skipping tests
3. build and deploy backend Docker container
4. build and deploy frontend Docker container

## One-time EC2 setup
Install required tools if missing:

```bash
sudo yum install -y git docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker jenkins
sudo usermod -aG docker ec2-user
```

Install Docker Compose if `docker compose` is missing:

```bash
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p "$DOCKER_CONFIG/cli-plugins"
curl -SL https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-x86_64 -o "$DOCKER_CONFIG/cli-plugins/docker-compose"
chmod +x "$DOCKER_CONFIG/cli-plugins/docker-compose"
docker compose version
```

Restart Jenkins after Docker group changes:

```bash
sudo systemctl restart jenkins
```

## Runtime ports
Open these ports in the EC2 security group if you want external access:
- `4173` for frontend
- `8082` for backend API direct access (optional)

Note: existing Jenkins may already use `8080`, so the deployed backend container is exposed on `8082`.

## Jenkins job requirements
Use your existing Pipeline job with:
- Branch: `*/dev`
- Script Path: `Jenkinsfile`

## Manual verification after a build
On the EC2 host:

```bash
docker ps
docker logs hawkeye-backend --tail 100
docker logs hawkeye-frontend --tail 100
ss -tulpn | grep -E '4173|8082'
```

Frontend URL:
```text
http://<EC2-PUBLIC-IP>:4173
```

Backend URL:
```text
http://<EC2-PUBLIC-IP>:8082
```

