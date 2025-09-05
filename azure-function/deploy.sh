#!/bin/bash

# Azure Function App Deployment Script
# This script deploys the calendar refresh function to Azure

set -e

# Configuration
RESOURCE_GROUP="roomtool-rg"
FUNCTION_APP_NAME="roomtool-calendar-function"
STORAGE_ACCOUNT="roomtoolstorage$(date +%s | tail -c 6)"  # Add random suffix
LOCATION="eastus"

echo "🚀 Deploying Azure Function App for Calendar Refresh"
echo "📍 Resource Group: $RESOURCE_GROUP"
echo "⚡ Function App: $FUNCTION_APP_NAME"
echo "💾 Storage Account: $STORAGE_ACCOUNT"
echo "🌍 Location: $LOCATION"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Please install it first:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Login check
if ! az account show &> /dev/null; then
    echo "🔑 Please login to Azure first:"
    az login
fi

echo "📋 Current Azure subscription:"
az account show --output table

echo "🏗️  Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

echo "💾 Creating storage account..."
az storage account create \
    --resource-group $RESOURCE_GROUP \
    --name $STORAGE_ACCOUNT \
    --location $LOCATION \
    --sku Standard_LRS

echo "⚡ Creating Function App..."
az functionapp create \
    --resource-group $RESOURCE_GROUP \
    --consumption-plan-location $LOCATION \
    --runtime python \
    --runtime-version 3.9 \
    --functions-version 4 \
    --name $FUNCTION_APP_NAME \
    --storage-account $STORAGE_ACCOUNT \
    --os-type Linux

echo "📦 Deploying function code..."
func azure functionapp publish $FUNCTION_APP_NAME --python

echo "✅ Deployment completed!"
echo ""
echo "📋 Function App Details:"
echo "   Function App Name: $FUNCTION_APP_NAME"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Calendar API URL: https://$FUNCTION_APP_NAME.azurewebsites.net/api/GetCalendar"
echo ""
echo "🔧 Next Steps:"
echo "1. Update your config.js file:"
echo "   azureFunctionUrl: \"https://$FUNCTION_APP_NAME.azurewebsites.net/api/GetCalendar\""
echo ""
echo "2. The timer function will automatically refresh calendars every 15 minutes"
echo ""
echo "3. Test the API endpoint:"
echo "   curl \"https://$FUNCTION_APP_NAME.azurewebsites.net/api/GetCalendar?room=confa\""