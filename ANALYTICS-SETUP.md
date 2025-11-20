# Analytics Setup Guide for BattenSpace

## Overview
BattenSpace includes comprehensive analytics tracking powered by Azure Application Insights. This guide will help you set up analytics to track visitor behavior, room popularity, and usage patterns.

## Current Status
✅ Analytics tracking code is deployed and working
✅ Console-only mode active (tracks to browser console)
⏳ Waiting for Application Insights configuration

## Quick Setup (5 minutes)

### Step 1: Create Application Insights Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"**
3. Search for **"Application Insights"**
4. Click **"Create"**

Configure the resource:
- **Subscription**: Your Azure subscription
- **Resource Group**: Use the same as your Static Web App (or create new)
- **Name**: `battenspace-analytics` (or your choice)
- **Region**: **East US** (or same as your Static Web App)
- **Resource Mode**: **Classic** (for client-side JavaScript SDK)

5. Click **"Review + Create"**
6. Click **"Create"**
7. Wait 1-2 minutes for deployment

### Step 2: Get Instrumentation Key

1. Go to your new Application Insights resource
2. In the left menu, click **"Overview"**
3. Find **"Instrumentation Key"** in the Essentials section
4. Click the **copy icon** to copy the key

It looks like: `12345678-1234-1234-1234-123456789abc`

### Step 3: Add Key to Your Site

**Option A: Environment Variable (Recommended)**

Add to your Static Web App configuration:

1. Go to **Static Web App** in Azure Portal
2. Click **"Configuration"** in left menu
3. Click **"+ Add"**
4. Add:
   - **Name**: `APPINSIGHTS_INSTRUMENTATION_KEY`
   - **Value**: `[paste your instrumentation key]`
5. Click **"OK"**
6. Click **"Save"**

Then update `analytics.js` line 17 to read from environment:
```javascript
const instrumentationKey = window.ENV?.APPINSIGHTS_INSTRUMENTATION_KEY || 'YOUR_INSTRUMENTATION_KEY_HERE';
```

**Option B: Direct Configuration (Quick but less secure)**

Edit `analytics.js` line 17 and replace the placeholder:
```javascript
const instrumentationKey = window.APPINSIGHTS_INSTRUMENTATION_KEY || 'YOUR_ACTUAL_KEY_HERE';
```

Replace `YOUR_ACTUAL_KEY_HERE` with your instrumentation key.

### Step 4: Deploy and Test

1. Commit and push your changes (if you edited analytics.js)
2. Wait for GitHub Actions deployment (2-3 minutes)
3. Visit your site
4. Open browser console (F12)
5. You should see: `📊 Analytics: Application Insights SDK loaded successfully`

### Step 5: Verify Data Collection

Wait 5-10 minutes for data to appear, then:

1. Go to **Application Insights** in Azure Portal
2. Click **"Logs"** in left menu
3. Run this query:

```kusto
customEvents
| where timestamp > ago(1h)
| summarize count() by name
| order by count_ desc
```

You should see events like:
- `DashboardViewed`
- `ViewModeChanged`
- `RoomViewed`

## What Gets Tracked

### Automatic Tracking
- ✅ Page views
- ✅ Session duration
- ✅ Browser/device information
- ✅ Geographic location
- ✅ Performance metrics

### Custom Events Tracked
1. **DashboardViewed** - When users open the dashboard
   - Property: `dashboardType` (main/advanced/simple)

2. **ViewModeChanged** - When users switch view modes
   - Properties: `fromMode`, `toMode` (day/week/month)

3. **RoomViewed** - When users view specific rooms
   - Properties: `roomName`, `viewMode`, `dayOfWeek`, `hour`

4. **EventClicked** - When users click calendar events
   - Properties: `eventName`, `roomName`

5. **RoomSearched** - When users search for rooms
   - Properties: `searchTerm`, `resultsCount`

6. **Error** - When errors occur
   - Properties: `message`, `context`

## Viewing Analytics

### In Azure Portal

**Real-time Monitoring:**
1. Go to **Application Insights** resource
2. Click **"Live Metrics"** - see real-time data

**Custom Queries:**
1. Click **"Logs"**
2. Use Kusto query language

Example queries:

**Most viewed rooms:**
```kusto
customEvents
| where name == "RoomViewed"
| summarize views = count() by tostring(customDimensions.roomName)
| order by views desc
```

**Peak usage hours:**
```kusto
customEvents
| where name == "DashboardViewed"
| extend hour = datetime_part("hour", timestamp)
| summarize visits = count() by hour
| order by hour asc
```

**View mode preferences:**
```kusto
customEvents
| where name == "ViewModeChanged"
| summarize switches = count() by tostring(customDimensions.toMode)
| order by switches desc
```

### In BattenSpace Dashboard

1. Click **📊 Analytics** button in header
2. View:
   - Total/Unique/Returning visitors
   - Most viewed rooms
   - Peak usage hours
   - View mode preferences

*Note: Dashboard currently shows mock data until real data API integration is added*

## Troubleshooting

### Analytics Not Working

**Check Console:**
1. Open browser console (F12)
2. Look for analytics messages starting with `📊`

**Common Issues:**

**"Application Insights key not configured"**
- The instrumentation key is not set
- Follow Step 3 above

**"Application Insights SDK loading..."**
- SDK is loading correctly
- Wait a few seconds for "SDK loaded successfully" message

**No data in Azure Portal**
- Wait 5-10 minutes for data to appear
- Check instrumentation key is correct
- Verify CORS settings allow `https://js.monitor.azure.com`

### CORS Issues

If analytics fails to load, add to `staticwebapp.config.json`:

```json
"globalHeaders": {
  "Content-Security-Policy": "default-src 'self' ... https://js.monitor.azure.com https://*.in.applicationinsights.azure.com ...;"
}
```

## Privacy & Data Retention

### What's Collected
- Anonymous usage patterns
- No personally identifiable information (PII)
- Browser/device type
- Geographic region (not precise location)
- Usage times and patterns

### Data Retention
- Default: 90 days
- Can be configured in Application Insights settings

### GDPR Compliance
Application Insights is GDPR compliant. No PII is collected by default.

## Cost

**Application Insights Pricing:**
- First 5 GB/month: Free
- After 5 GB: $2.30 per GB

**Expected Usage:**
- Small site (<1000 visits/day): **Free tier sufficient**
- Medium site (1000-10000 visits/day): ~$5-20/month
- Large site (>10000 visits/day): ~$20-50/month

## Support

### Documentation
- [Application Insights JavaScript SDK](https://docs.microsoft.com/azure/azure-monitor/app/javascript)
- [Application Insights Overview](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)

### Help
- Check browser console for error messages
- Review Azure Application Insights logs
- Contact: Ben Hartless (bh4hb@virginia.edu)

## Next Steps

Once analytics is working:

1. **Monitor Usage** - Check dashboard weekly for insights
2. **Optimize Popular Rooms** - Focus on most-used spaces
3. **Identify Peak Times** - Plan maintenance during low-usage periods
4. **Track Improvements** - See how changes affect usage

---

*Last updated: November 20, 2025*
*Version: 1.0*
