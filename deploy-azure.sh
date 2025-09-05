#!/bin/bash

echo ""
echo "========================================"
echo " RoomTool - Azure App Service Deployment"
echo "========================================"
echo ""

# Configuration - UPDATE THESE VALUES
RESOURCE_GROUP="roomtool-rg"
APP_SERVICE_PLAN="roomtool-plan"
WEB_APP_NAME="roomtool-app"  # Must be globally unique
LOCATION="eastus"
GITHUB_REPO="https://github.com/BattenIT/RoomTool.git"

echo "🚀 Deploying RoomTool to Azure App Service..."
echo "📍 Resource Group: $RESOURCE_GROUP"
echo "🌐 Web App: $WEB_APP_NAME.azurewebsites.net"
echo "📍 Location: $LOCATION"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ ERROR: Azure CLI is not installed"
    echo "Install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "❌ ERROR: Not logged in to Azure"
    echo "Please run: az login"
    exit 1
fi

# Create resource group
echo "📂 Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service plan (Linux, PHP support)
echo "📋 Creating App Service plan..."
az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --sku B1 \
    --is-linux

# Create web app with PHP 8.1 runtime
echo "🌐 Creating web app..."
az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --name $WEB_APP_NAME \
    --runtime "PHP|8.1"

# Configure deployment from GitHub
echo "📥 Setting up GitHub deployment..."
az webapp deployment source config \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --repo-url $GITHUB_REPO \
    --branch main \
    --manual-integration

# Configure app settings for PHP
echo "⚙️  Configuring application settings..."
az webapp config appsettings set \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings \
    "PHP_VERSION=8.1" \
    "SCM_DO_BUILD_DURING_DEPLOYMENT=true"

# Configure custom startup script
echo "🔧 Setting up custom startup..."
cat > startup.sh << 'EOF'
#!/bin/bash
# Enable Apache modules
a2enmod rewrite
a2enmod headers

# Set proper permissions
chown -R www-data:www-data /home/site/wwwroot
chmod -R 755 /home/site/wwwroot

# Start Apache
apache2-foreground
EOF

# Upload startup script
az webapp config set \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --startup-file "startup.sh"

# Enable HTTPS only
echo "🔒 Enabling HTTPS only..."
az webapp update \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --https-only true

# Configure custom domain (optional)
echo "🌍 Custom domain setup..."
echo "To add custom domain later, run:"
echo "az webapp config hostname add --webapp-name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --hostname yourdomain.com"

# Get deployment URL
WEB_APP_URL="https://$WEB_APP_NAME.azurewebsites.net"

echo ""
echo "========================================"
echo " Deployment Complete!"
echo "========================================"
echo ""
echo "🌍 Your RoomTool is available at:"
echo "   $WEB_APP_URL"
echo ""
echo "📊 Monitor your app:"
echo "   Azure Portal → App Services → $WEB_APP_NAME"
echo ""
echo "🔧 To redeploy:"
echo "   Push changes to GitHub main branch"
echo "   Azure will automatically redeploy!"
echo ""
echo "📋 Management commands:"
echo "   az webapp log tail --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP"
echo "   az webapp restart --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP"
echo ""

# Test deployment
echo "🧪 Testing deployment..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WEB_APP_URL" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ SUCCESS: Website is responding correctly"
else
    echo "⚠️  WARNING: Website returned status $HTTP_STATUS"
    echo "   It may take a few minutes for deployment to complete"
fi

echo ""
echo "💰 Estimated monthly cost: ~$13 USD (B1 App Service Plan)"
echo "💡 To reduce costs, use F1 (Free) tier for testing"
echo ""