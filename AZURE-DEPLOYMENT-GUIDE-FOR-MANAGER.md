# RoomTool Azure Deployment Guide - For Management

## Executive Summary

The RoomTool is ready for production deployment on Microsoft Azure. This guide provides step-by-step instructions for deploying and managing the application with **zero coding knowledge required**.

**Key Benefits of Azure Deployment:**
- ✅ **Automatic scaling** - handles traffic spikes
- ✅ **Built-in security** - HTTPS, security headers
- ✅ **99.95% uptime SLA** - reliable service
- ✅ **Automatic updates** - deploys from GitHub automatically
- ✅ **Cost effective** - ~$13/month for production use

---

## Prerequisites (One-time setup)

### 1. Azure Account Setup
- **Azure subscription** (use UVA enterprise account if available)
- **Billing configured** (credit card or enterprise billing)

### 2. Install Azure CLI (15 minutes)
**Windows:**
1. Download from: https://aka.ms/installazurecliwindows
2. Run installer and follow prompts
3. Open Command Prompt and verify: `az --version`

**Mac:**
```bash
brew install azure-cli
```

### 3. Initial Azure Login
```bash
az login
```
This opens a browser window - log in with your Azure credentials.

---

## Deployment Steps (30 minutes)

### Step 1: Configure Deployment Script
1. **Open the file:** `deploy-azure.sh`
2. **Edit these three lines:**
   ```bash
   WEB_APP_NAME="roomtool-batten"  # Must be globally unique!
   RESOURCE_GROUP="batten-roomtool-rg"
   LOCATION="eastus"
   ```
3. **Save the file**

**Important:** `WEB_APP_NAME` must be unique across all of Azure. Try variations like:
- `uva-batten-roomtool`
- `roomtool-batten-2024`
- `batten-room-dashboard`

### Step 2: Run Deployment
**Windows (Git Bash or WSL):**
```bash
chmod +x deploy-azure.sh
./deploy-azure.sh
```

**Mac/Linux:**
```bash
chmod +x deploy-azure.sh
./deploy-azure.sh
```

### Step 3: Wait for Completion
- **Setup time:** 5-10 minutes
- **First deployment:** Additional 10-15 minutes
- **You'll see progress messages**

### Step 4: Verify Deployment
The script will provide a URL like: `https://roomtool-batten.azurewebsites.net`

**Test checklist:**
- ✅ Website loads without errors
- ✅ Room calendars display correctly
- ✅ Events show for today/tomorrow
- ✅ All Pavilion X rooms have live data

---

## Post-Deployment Management

### Automatic Updates
**No action needed!** When developers push code changes to GitHub:
1. Azure automatically detects changes
2. Deploys new version within 2-3 minutes
3. Zero downtime deployment

### Monitoring the Application

#### Check Application Health
```bash
az webapp browse --name roomtool-batten --resource-group batten-roomtool-rg
```

#### View Application Logs
```bash
az webapp log tail --name roomtool-batten --resource-group batten-roomtool-rg
```

#### Restart Application (if needed)
```bash
az webapp restart --name roomtool-batten --resource-group batten-roomtool-rg
```

### Azure Portal Management
1. **Go to:** https://portal.azure.com
2. **Navigate to:** App Services → your-app-name
3. **Monitor:** Overview tab shows health, requests, response times
4. **View logs:** Monitoring → Log stream

---

## Domain Name Setup (Optional)

### Using UVA Domain
If you want `roomtool.batten.virginia.edu`:

1. **Contact UVA IT** to create DNS record pointing to your Azure app
2. **Add custom domain in Azure:**
   ```bash
   az webapp config hostname add \
     --webapp-name roomtool-batten \
     --resource-group batten-roomtool-rg \
     --hostname roomtool.batten.virginia.edu
   ```

### SSL Certificate
Azure provides **free SSL certificates** for custom domains automatically.

---

## Cost Management

### Current Configuration Cost
- **App Service B1:** ~$13/month
- **Bandwidth:** ~$1-2/month (typical usage)
- **Total:** ~$15/month

### Cost Optimization Options
1. **Free Tier (F1):** $0/month
   - Good for testing/internal use
   - Limited to 60 minutes/day
   - No custom domains

2. **Standard Tier (S1):** ~$56/month
   - Better performance
   - Auto-scaling
   - More advanced features

### Monitor Costs
- **Azure Portal:** Cost Management → Cost Analysis
- **Set up alerts** for spending thresholds
- **Regular review** recommended monthly

---

## Security & Compliance

### Built-in Security Features
- ✅ **HTTPS enforced** automatically
- ✅ **Security headers** configured
- ✅ **Azure firewall** protection
- ✅ **DDoS protection** included

### UVA Compliance Considerations
- **Data Location:** East US data center
- **Data Protection:** Microsoft Azure compliance certifications
- **Access Control:** Managed through Azure AD integration (optional)

### Recommended Security Enhancements
1. **Enable Application Insights** for monitoring
2. **Set up Azure Active Directory** authentication (if internal use only)
3. **Configure firewall rules** if restricting access

---

## Troubleshooting

### Common Issues

#### 1. "Web app name not available"
**Error:** The name is already taken globally  
**Solution:** Try a different name in `deploy-azure.sh`

#### 2. "Subscription not found"
**Error:** Not logged in or wrong subscription  
**Solution:**
```bash
az login
az account list
az account set --subscription "your-subscription-name"
```

#### 3. Website shows error page
**Check application logs:**
```bash
az webapp log tail --name your-app-name --resource-group your-resource-group
```

#### 4. Calendar data not updating
**Possible causes:**
- Calendar URLs changed
- Network connectivity issues
- PHP configuration problems

**Solution:** Check logs and contact developer if needed

### Getting Help
1. **Check application logs** first
2. **Azure Portal** → Support → New Support Request
3. **Contact UVA IT** for infrastructure issues
4. **GitHub repository** issues for application bugs

---

## Maintenance Schedule

### Weekly
- ✅ **Check application health** in Azure Portal
- ✅ **Verify calendar accuracy** by spot-checking events

### Monthly
- ✅ **Review costs** in Azure Portal
- ✅ **Check for Azure updates** (usually automatic)
- ✅ **Verify SSL certificate** status

### Quarterly
- ✅ **Review access logs** for security
- ✅ **Test disaster recovery** procedures
- ✅ **Evaluate performance** and scaling needs

---

## Emergency Contacts

### Technical Issues
- **Developer:** Ben Hartless (bh4hb@virginia.edu)
- **UVA IT Support:** [standard UVA IT contact]
- **Azure Support:** Available 24/7 through Azure Portal

### Business Issues
- **Batten School IT Coordinator:** [contact info]
- **Building Operations:** [for room booking conflicts]

---

## Quick Reference Commands

```bash
# Check deployment status
az webapp show --name roomtool-batten --resource-group batten-roomtool-rg

# View recent logs
az webapp log tail --name roomtool-batten --resource-group batten-roomtool-rg

# Restart application
az webapp restart --name roomtool-batten --resource-group batten-roomtool-rg

# Check costs
az consumption usage list --top 10

# Scale up (if more performance needed)
az appservice plan update --name roomtool-plan --resource-group batten-roomtool-rg --sku S1
```

---

## Success Metrics

After deployment, the application should provide:

### Functionality
- ✅ **Real-time room availability** for all configured spaces
- ✅ **Recurring event support** for weekly meetings
- ✅ **Mobile-friendly interface** for staff and students
- ✅ **Automatic updates** without IT intervention

### Performance
- ✅ **Page load time** under 3 seconds
- ✅ **99.9%+ uptime** based on Azure SLA
- ✅ **Calendar refresh** every 5 minutes

### User Experience
- ✅ **Easy to read** schedule format
- ✅ **Professional branding** with UVA/Batten/Karsh logos
- ✅ **Intuitive navigation** requiring no training

---

**Deployment Date:** _______________  
**Deployed By:** ___________________  
**Application URL:** _______________  
**Total Setup Time:** ______________  

*Keep this document for future reference and share with other administrators as needed.*