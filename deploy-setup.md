# Simple CI/CD Setup Guide

## 🚀 Quick Setup

### 1. EC2 Instance Setup

SSH into your EC2 instance and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/student-ranking-staging
sudo chown $USER:$USER /var/www/student-ranking-staging

# Clone your repo
cd /var/www/student-ranking-staging
git clone https://github.com/Klaus073/Student-Ranking.git .
git checkout staging

# Install dependencies
npm ci --production

# Start with PM2
pm2 start npm --name "student-ranking-staging" -- start
pm2 save
pm2 startup
```

### 2. GitHub Secrets

Add these to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Value | Example |
|-------------|-------|---------|
| `EC2_HOST` | Your EC2 public IP | `3.123.45.67` |
| `EC2_USER` | SSH username | `ubuntu` |
| `EC2_SSH_KEY` | Your private SSH key | Contents of your `.pem` file |
| `STAGING_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `STAGING_SUPABASE_ANON_KEY` | Supabase anon key | `eyJ0eXAiOiJKV1Q...` |

### 3. Test Deployment

Push to staging branch:

```bash
git add .
git commit -m "Setup CI/CD"
git push origin staging
```

## 🔧 How it Works

1. **On Push to Staging**: 
   - Runs tests and linting
   - Builds the application
   - Deploys to EC2 if tests pass

2. **Deployment Process**:
   - SSH into EC2
   - Pull latest code
   - Install dependencies
   - Build application
   - Restart with PM2
   - Health check

## 📋 Manual Commands (if needed)

On EC2:
```bash
# Check app status
pm2 status

# View logs
pm2 logs student-ranking-staging

# Restart app
pm2 restart student-ranking-staging

# Check if app is responding
curl http://localhost:3000
```

## 🔍 Troubleshooting

- **SSH fails**: Check your EC2 security group allows SSH (port 22)
- **App won't start**: Check PM2 logs with `pm2 logs`
- **Build fails**: Check if all environment variables are set
- **Port issues**: Make sure port 3000 is available

That's it! Simple and effective. 🎉