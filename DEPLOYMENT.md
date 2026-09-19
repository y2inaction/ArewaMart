# ArewaMart EC2 Deployment

## PowerShell

```powershell
ssh -i "C:\Users\NOBLEN\Downloads\my-vps-key.pem" ubuntu@YOUR_EC2_IP
```

## Ubuntu

```bash
sudo apt update
sudo apt install -y git docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
exit
```

Reconnect:

```powershell
ssh -i "C:\Users\NOBLEN\Downloads\my-vps-key.pem" ubuntu@YOUR_EC2_IP
```

Clone the repository:

```bash
git clone YOUR_AREWAMART_REPOSITORY_URL ~/arewamart
cd ~/arewamart
cp .env.example .env
nano .env
```

Start:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f app
```

Health check:

```bash
curl http://127.0.0.1:3000
```

Do not expose PostgreSQL publicly. Only expose the web reverse proxy.
