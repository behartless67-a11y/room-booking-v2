#!/bin/bash

echo ""
echo "========================================"
echo " RoomTool - EC2 Deployment Script"
echo "========================================"
echo ""

# Configuration - UPDATE THESE VALUES
EC2_HOST="your-ec2-public-ip-here"
EC2_USER="ec2-user"
EC2_KEY="path/to/your/key.pem"
DEPLOY_METHOD="github"  # "github" or "local"

# Check if configuration is set
if [ "$EC2_HOST" = "your-ec2-public-ip-here" ]; then
    echo "❌ ERROR: Please configure this script first"
    echo "Edit deploy-ec2.sh and set:"
    echo "  - EC2_HOST (your EC2 public IP)"
    echo "  - EC2_KEY (path to your .pem key file)"
    exit 1
fi

echo "🚀 Deploying RoomTool to EC2..."
echo "📍 Host: $EC2_HOST"
echo "👤 User: $EC2_USER"
echo "📋 Method: $DEPLOY_METHOD"
echo ""

# Function to deploy via GitHub
deploy_github() {
    echo "📥 Deploying from GitHub repository..."
    
    ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" << 'EOF'
        # Navigate to web directory
        cd /var/www/html
        
        # Remove existing files (except .git)
        sudo find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} +
        
        # Clone or pull from GitHub
        if [ -d ".git" ]; then
            echo "📄 Pulling latest changes..."
            sudo git pull origin main
        else
            echo "📥 Cloning repository..."
            sudo git clone https://github.com/BattenIT/RoomTool.git .
        fi
        
        # Set proper permissions
        sudo chown -R ec2-user:apache /var/www/html
        sudo chmod -R 755 /var/www/html
        sudo chmod 644 *.php *.html *.js *.css 2>/dev/null || true
        
        echo "✅ GitHub deployment complete!"
EOF
}

# Function to deploy local files
deploy_local() {
    echo "📤 Uploading local files..."
    
    # Create list of files to upload
    FILES_TO_UPLOAD="
        index.html
        config.js
        calendar-proxy.php
        ics/
        img/
        *.png
        *.css
        *.js
    "
    
    # Upload files
    for file in $FILES_TO_UPLOAD; do
        if [ -e "$file" ]; then
            echo "📄 Uploading $file..."
            if [ -d "$file" ]; then
                # Directory
                scp -i "$EC2_KEY" -r "$file" "$EC2_USER@$EC2_HOST:/var/www/html/"
            else
                # File or glob pattern
                scp -i "$EC2_KEY" $file "$EC2_USER@$EC2_HOST:/var/www/html/" 2>/dev/null || true
            fi
        fi
    done
    
    # Set permissions on remote server
    ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" << 'EOF'
        sudo chown -R ec2-user:apache /var/www/html
        sudo chmod -R 755 /var/www/html
        sudo chmod 644 /var/www/html/*.php /var/www/html/*.html /var/www/html/*.js /var/www/html/*.css 2>/dev/null || true
        echo "✅ Local deployment complete!"
EOF
}

# Function to test deployment
test_deployment() {
    echo ""
    echo "🧪 Testing deployment..."
    
    # Test basic HTTP response
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$EC2_HOST" || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ HTTP: Website is responding correctly"
    else
        echo "❌ HTTP: Website returned status $HTTP_STATUS"
    fi
    
    # Test PHP functionality
    PHP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$EC2_HOST/calendar-proxy.php?url=https://google.com" || echo "000")
    
    if [ "$PHP_STATUS" = "200" ] || [ "$PHP_STATUS" = "400" ]; then
        echo "✅ PHP: Calendar proxy is working"
    else
        echo "❌ PHP: Calendar proxy returned status $PHP_STATUS"
    fi
}

# Main deployment logic
case $DEPLOY_METHOD in
    "github")
        deploy_github
        ;;
    "local")
        deploy_local
        ;;
    *)
        echo "❌ ERROR: Invalid deployment method. Use 'github' or 'local'"
        exit 1
        ;;
esac

# Test the deployment
test_deployment

echo ""
echo "========================================"
echo " Deployment Complete!"
echo "========================================"
echo ""
echo "🌍 Your RoomTool is now available at:"
echo "   http://$EC2_HOST"
echo ""
echo "📊 To monitor your application:"
echo "   ssh -i $EC2_KEY $EC2_USER@$EC2_HOST"
echo "   sudo tail -f /var/log/httpd/access_log"
echo ""
echo "🔧 To update in the future:"
echo "   Just run this script again!"
echo ""