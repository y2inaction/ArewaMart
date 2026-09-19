# ArewaMart Production Deployment Guide

## EC2 Instance Setup

### From Windows PowerShell

```powershell
$keyPath = "C:\Users\NOBLEN\Downloads\arewamart-key.pem"
$ip = "YOUR_EC2_PUBLIC_IP"

# Connect to instance
ssh -i $keyPath ubuntu@$ip
```

### Setup Docker Environment

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Enable Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Log out and back in for group changes to take effect
exit
```

Reconnect after logout.

### Install Nginx & SSL

```bash
# Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx

# Start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Setup SSL (replace with your domain)
sudo certbot certonly --standalone -d arewamart.com -d www.arewamart.com
```

## Application Deployment

### Clone & Configure

```bash
# Clone repository
cd /home/ubuntu
git clone https://github.com/y2inaction/ArewaMart.git
cd ArewaMart

# Setup environment
cp .env.example .env
nano .env

# Set production values:
# NODE_ENV=production
# DATABASE_URL="postgresql://arewamart_user:PASSWORD@db:5432/arewamart"
# JWT_SECRET="your-random-32-char-string"
# REFRESH_TOKEN_SECRET="your-random-32-char-string"
# PAYSTACK_SECRET_KEY="your-paystack-key"
# PAYSTACK_PUBLIC_KEY="your-paystack-public-key"
# NEXT_PUBLIC_SITE_URL="https://arewamart.com"
```

### Start Application

```bash
# Build and start
docker-compose build
docker-compose up -d

# Verify
docker-compose ps
docker-compose logs -f app

# Wait for database migrations to complete (~30 seconds)
```

### Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/arewamart`:

```nginx
upstream arewamart {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name arewamart.com www.arewamart.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name arewamart.com www.arewamart.com;

    ssl_certificate /etc/letsencrypt/live/arewamart.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/arewamart.com/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    gzip on;
    gzip_types text/plain text/css text/javascript application/json;

    location / {
        proxy_pass http://arewamart;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/arewamart /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Database Backups

Create backup script `/home/ubuntu/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

cd /home/ubuntu/ArewaMart
docker-compose exec -T db pg_dump -U arewamart arewamart | gzip > $BACKUP_DIR/arewamart_$TIMESTAMP.sql.gz

# Keep last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

Setup cron:

```bash
chmod +x /home/ubuntu/backup-db.sh
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup-db.sh
```

## Operations

### Health Check

```bash
curl https://arewamart.com
```

### View Logs

```bash
cd /home/ubuntu/ArewaMart
docker-compose logs -f app
docker-compose logs -f db
```

### Restart Services

```bash
cd /home/ubuntu/ArewaMart
docker-compose restart app
docker-compose restart db
docker-compose restart
```

### Update Application

```bash
cd /home/ubuntu/ArewaMart
git pull origin main
docker-compose build
docker-compose up -d
```

### Database Management

```bash
# Access database
docker-compose exec db psql -U arewamart -d arewamart

# Backup
docker-compose exec db pg_dump -U arewamart arewamart > backup.sql

# Restore
cat backup.sql | docker-compose exec -T db psql -U arewamart -d arewamart
```

## SSL Certificate Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Enable auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Monitoring

Key metrics to monitor:
- Application response time (target: <200ms)
- Error rate (target: <1%)
- Disk space: `df -h`
- Memory: `free -m`
- Docker stats: `docker stats`
- Logs: Check for errors and warnings

## Troubleshooting

### Application won't start
```bash
docker-compose logs app
docker-compose ps
```

### Database connection errors
```bash
docker-compose logs db
docker-compose ps
```

### Nginx errors
```bash
sudo tail -f /var/log/nginx/error.log
sudo nginx -t
```

### Test local connection
```bash
curl http://localhost:3000
```

## Security Checklist

- [ ] Change default database password
- [ ] Restrict EC2 security group
- [ ] Enable SSL/TLS (HTTPS)
- [ ] Setup firewall: `sudo ufw enable`
- [ ] Regular updates: `sudo apt update && sudo apt upgrade`
- [ ] Monitor API usage
- [ ] Rotate secrets periodically
- [ ] Backup database daily
- [ ] Monitor disk space
- [ ] Check SSL expiry: `sudo certbot renew --dry-run`

## Scaling

For higher traffic:
1. Add database read replicas
2. Add Redis cache layer
3. Use CloudFront CDN
4. Add load balancer (AWS ALB)
5. Run multiple application instances

---

*For questions or issues, check logs and follow troubleshooting section above.*
