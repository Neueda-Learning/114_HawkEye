# HawkEye CD deployment

This deployment flow is designed for Jenkins running on the same Linux EC2 host as the application.

## What gets deployed
- Backend jar -> `/var/lib/jenkins/apps/hawkeye/backend/app.jar`
- Frontend static build -> `/var/lib/jenkins/apps/hawkeye/frontend/dist`
- Frontend app server -> Node process on port `4173`
- Frontend `/api/*` calls are proxied to backend `http://127.0.0.1:8080`

## Jenkins behavior
The root `Jenkinsfile` on branch `dev` will:
1. build backend with Maven, skipping tests
2. build frontend with Vite, skipping tests
3. deploy backend
4. deploy frontend

## One-time EC2 setup
Install required tools if missing:

```bash
sudo yum install -y git
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
java -version
node -v
npm -v
```

Ensure Jenkins can write to the deploy directory:

```bash
sudo mkdir -p /var/lib/jenkins/apps/hawkeye
sudo chown -R jenkins:jenkins /var/lib/jenkins/apps
```

Open these ports in the EC2 security group if you want external access:
- `8080` for backend
- `4173` for frontend
- `8080` Jenkins may already be in use on your host; if so, only expose the frontend port externally

## Jenkins job requirements
Use your existing Pipeline job with:
- Branch: `*/dev`
- Script Path: `Jenkinsfile`

## Manual verification after a build
On the EC2 host:

```bash
ps -ef | grep hawkeye | grep -v grep
ss -tulpn | grep -E '8080|4173'
tail -n 100 /var/lib/jenkins/apps/hawkeye/backend/backend.out.log
tail -n 100 /var/lib/jenkins/apps/hawkeye/backend/backend.err.log
tail -n 100 /var/lib/jenkins/apps/hawkeye/frontend/frontend.out.log
tail -n 100 /var/lib/jenkins/apps/hawkeye/frontend/frontend.err.log
```

Frontend URL:
```text
http://<EC2-PUBLIC-IP>:4173
```

If backend is also externally reachable:
```text
http://<EC2-PUBLIC-IP>:8080
```

