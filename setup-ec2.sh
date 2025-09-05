#!/bin/bash

echo ""
echo "========================================"
echo " RoomTool - EC2 LAMP Stack Setup"
echo "========================================"
echo ""
echo "This script will install Apache, PHP, and configure the server"
echo "Run this on your EC2 instance after launching"
echo ""

# Update system packages
echo "📦 Updating system packages..."
sudo yum update -y

# Install Apache
echo "🌐 Installing Apache..."
sudo yum install -y httpd

# Install PHP and required extensions
echo "🐘 Installing PHP and extensions..."
sudo yum install -y php php-common php-curl php-json php-mbstring

# Start and enable Apache
echo "🚀 Starting Apache..."
sudo systemctl start httpd
sudo systemctl enable httpd

# Configure Apache for RoomTool
echo "⚙️  Configuring Apache..."

# Set proper permissions for web directory
sudo chown -R ec2-user:apache /var/www/html
sudo chmod -R 755 /var/www/html

# Create Apache configuration for RoomTool
sudo tee /etc/httpd/conf.d/roomtool.conf > /dev/null << 'EOF'
<VirtualHost *:80>
    DocumentRoot /var/www/html
    ServerName roomtool
    
    # Enable PHP
    DirectoryIndex index.html index.php
    
    # Security headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    
    # Enable CORS for calendar proxy
    <Files "calendar-proxy.php">
        Header always set Access-Control-Allow-Origin "*"
        Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
        Header always set Access-Control-Allow-Headers "Content-Type"
    </Files>
    
    # Cache static assets
    <LocationMatch "\.(css|js|png|jpg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 month"
    </LocationMatch>
    
    # Don't cache calendar data
    <Files "calendar-proxy.php">
        ExpiresActive Off
        Header set Cache-Control "no-cache, no-store, must-revalidate"
        Header set Pragma "no-cache"
        Header set Expires "0"
    </Files>
</VirtualHost>
EOF

# Install Git for deployment
echo "📂 Installing Git..."
sudo yum install -y git

# Install SSL module for future HTTPS support
echo "🔒 Installing SSL module..."
sudo yum install -y mod_ssl

# Restart Apache to apply configuration
echo "🔄 Restarting Apache..."
sudo systemctl restart httpd

# Check Apache status
echo "✅ Checking Apache status..."
sudo systemctl status httpd --no-pager -l

# Get instance information
echo ""
echo "========================================"
echo " Setup Complete!"
echo "========================================"
echo ""
echo "🌐 Apache is running on port 80"
echo "📁 Web root: /var/www/html"
echo "⚙️  Config: /etc/httpd/conf.d/roomtool.conf"
echo "📋 Apache logs: /var/log/httpd/"
echo ""
echo "Next steps:"
echo "1. Run the deployment script to upload your files"
echo "2. Configure your domain name"
echo "3. Set up SSL certificate"
echo ""

# Show public IP
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
PUBLIC_IP=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4)
echo "🌍 Your server will be accessible at: http://$PUBLIC_IP"
echo ""