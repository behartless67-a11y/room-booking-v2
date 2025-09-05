# RoomTool - EC2 Deployment Guide

This guide will help you deploy the RoomTool to AWS EC2 with full PHP/Apache support.

## Prerequisites

- AWS Account with EC2 access
- AWS CLI configured locally (optional)
- SSH key pair for EC2 access
- Git (for automated deployments)

## Step 1: Launch EC2 Instance

1. **Go to AWS EC2 Console**
2. **Launch Instance:**
   - **Name:** RoomTool-Server
   - **AMI:** Amazon Linux 2 (free tier eligible)
   - **Instance Type:** t3.micro (free tier) or t3.small
   - **Key Pair:** Create new or use existing
   - **Security Group:** Create with these rules:
     - SSH (22) - Your IP
     - HTTP (80) - 0.0.0.0/0 (public)
     - HTTPS (443) - 0.0.0.0/0 (public)
   - **Storage:** 8 GB gp2 (default)
3. **Launch** the instance

## Step 2: Set Up the Server

1. **Connect to your instance:**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-public-ip
   ```

2. **Upload and run the setup script:**
   ```bash
   # Upload the setup script
   scp -i your-key.pem setup-ec2.sh ec2-user@your-ec2-public-ip:~/
   
   # Connect and run setup
   ssh -i your-key.pem ec2-user@your-ec2-public-ip
   chmod +x setup-ec2.sh
   ./setup-ec2.sh
   ```

3. **Wait for setup to complete** (about 2-3 minutes)

## Step 3: Deploy Your Application

### Option A: Deploy from GitHub (Recommended)

1. **Configure the deployment script:**
   ```bash
   # Edit deploy-ec2.sh locally
   EC2_HOST="your-ec2-public-ip"
   EC2_KEY="path/to/your-key.pem"
   DEPLOY_METHOD="github"
   ```

2. **Run deployment:**
   ```bash
   chmod +x deploy-ec2.sh
   ./deploy-ec2.sh
   ```

### Option B: Deploy Local Files

1. **Configure for local deployment:**
   ```bash
   # Edit deploy-ec2.sh
   DEPLOY_METHOD="local"
   ```

2. **Run deployment:**
   ```bash
   ./deploy-ec2.sh
   ```

## Step 4: Access Your Application

1. **Find your EC2 public IP** in the AWS console
2. **Visit:** `http://your-ec2-public-ip`
3. **Test the calendar functionality**

## Step 5: Set Up Domain (Optional)

### Using Route 53:

1. **Create hosted zone** for your domain
2. **Create A record** pointing to your EC2 IP
3. **Update nameservers** with your domain registrar

### Example DNS setup:
```
Type: A
Name: roomtool.yourdomain.com
Value: your-ec2-public-ip
TTL: 300
```

## Step 6: Add SSL Certificate (Recommended)

1. **Install Certbot:**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-public-ip
   sudo yum install -y certbot python3-certbot-apache
   ```

2. **Get certificate:**
   ```bash
   sudo certbot --apache -d your-domain.com
   ```

3. **Test auto-renewal:**
   ```bash
   sudo certbot renew --dry-run
   ```

## Maintenance

### Update Application:
```bash
./deploy-ec2.sh
```

### View Logs:
```bash
ssh -i your-key.pem ec2-user@your-ec2-public-ip
sudo tail -f /var/log/httpd/access_log
sudo tail -f /var/log/httpd/error_log
```

### Restart Apache:
```bash
sudo systemctl restart httpd
```

## Troubleshooting

### Common Issues:

1. **Can't connect to instance:**
   - Check security group allows SSH from your IP
   - Verify key file permissions: `chmod 400 your-key.pem`

2. **Website not loading:**
   - Check security group allows HTTP (port 80)
   - Verify Apache is running: `sudo systemctl status httpd`

3. **Calendar not updating:**
   - Check PHP error logs: `sudo tail /var/log/httpd/error_log`
   - Test calendar proxy directly: `http://your-ip/calendar-proxy.php`

4. **Permission errors:**
   - Reset permissions: `sudo chown -R ec2-user:apache /var/www/html`

## Security Notes

- Keep your EC2 instance updated: `sudo yum update`
- Use SSL certificates in production
- Consider restricting SSH access to specific IPs
- Monitor access logs for unusual activity

## Cost Estimation

- **t3.micro (free tier):** $0/month for first year
- **t3.small:** ~$15/month
- **Data transfer:** Minimal for internal use
- **Route 53 (if used):** ~$0.50/month per domain

---

**Need help?** Contact your system administrator or AWS support.