# Azure Function Deployment Issue - Needs IT Support

## Current Problem
**Website**: https://nice-dune-0d695b810.2.azurestaticapps.net/
**Status**: No events displaying - calendar data cannot load
**Cause**: Azure Function not executing (code deployment failed)

## Why This Happened
The Azure Function deployment put files in the wrong structure. Portal shows functions as "Enabled" but code is missing/empty when you view it.

## Quick Fix Needed
Someone with Azure admin access needs to **redeploy the Azure Function** using one of these methods:

### Method 1: Using Azure Functions Core Tools (Easiest)
```bash
cd azure-function
func azure functionapp publish roomtool-calendar-function
```

### Method 2: Using VS Code
1. Install "Azure Functions" extension in VS Code
2. Sign in to Azure
3. Right-click `azure-function` folder
4. Select "Deploy to Function App"
5. Choose `roomtool-calendar-function`

### Method 3: Recreate Function App (if above fails)
Contact IT to recreate the function app from scratch.

## After Fix - Update Website Config
Once function works, update config.js to re-enable Azure Function.

Contact: bh4hb@virginia.edu
