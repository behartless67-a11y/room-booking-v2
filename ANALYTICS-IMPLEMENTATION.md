# Analytics Implementation Documentation

**BattenSpace Analytics System**
**Implementation Date**: November 20, 2025
**Version**: 1.0

## Overview

This document provides a complete technical reference for the BattenSpace analytics implementation using Azure Application Insights. The analytics system tracks user behavior, room popularity, and usage patterns to help understand how the BattenSpace dashboard is being used.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Implementation Details](#implementation-details)
3. [Tracked Events](#tracked-events)
4. [Configuration](#configuration)
5. [Data Access](#data-access)
6. [Troubleshooting](#troubleshooting)
7. [Future Enhancements](#future-enhancements)

## System Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│ BattenSpace Frontend (index.html, analytics-dashboard.html) │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ analytics.js (BattenAnalytics Class)               │     │
│  │                                                     │     │
│  │ • trackPageView()                                   │     │
│  │ • trackViewModeChange()                            │     │
│  │ • trackRoomView()                                  │     │
│  │ • trackDashboardView()                             │     │
│  │ • trackEventClick()                                │     │
│  │ • trackRoomSearch()                                │     │
│  │ • trackError()                                     │     │
│  │ • trackSessionEnd()                                │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Application Insights JavaScript SDK  │
        │ (https://js.monitor.azure.com)       │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Azure Application Insights           │
        │                                       │
        │ Instrumentation Key:                 │
        │ 99b03178-5fa4-40a6-8d6c-9023f5dca71b │
        │                                       │
        │ Ingestion: eastus-8                  │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Data Storage & Querying              │
        │                                       │
        │ • Logs (Kusto queries)               │
        │ • Live Metrics                       │
        │ • Dashboards                         │
        └──────────────────────────────────────┘
```

### Data Flow

1. **User Action** → JavaScript event (click, navigation, search, etc.)
2. **BattenAnalytics** → Captures event and creates tracking object
3. **App Insights SDK** → Transmits data to Azure endpoint
4. **Azure Ingestion** → Processes and stores telemetry data
5. **Data Available** → Queryable in Azure Portal (5-10 min delay)

## Implementation Details

### Core Files

#### 1. analytics.js

**Location**: `/analytics.js`
**Purpose**: Main analytics tracking engine
**Key Class**: `BattenAnalytics`

**Initialization**:
```javascript
// Automatically initialized on page load
window.BattenAnalytics = new BattenAnalytics();
```

**Configuration**:
- Instrumentation Key: Hardcoded with fallback to `window.APPINSIGHTS_INSTRUMENTATION_KEY`
- Auto-tracking: Page views, session duration
- Fallback Mode: Console logging if SDK fails to load

**Key Methods**:

| Method | Parameters | Purpose | Example |
|--------|-----------|---------|---------|
| `trackPageView()` | `pageName, properties` | Track page navigation | Called on DOMContentLoaded |
| `trackViewModeChange()` | `oldMode, newMode` | Track view mode switching | day → week → month |
| `trackRoomView()` | `roomName, viewMode` | Track room viewing | "Great Hall 100", "day" |
| `trackDashboardView()` | `dashboardType` | Track dashboard type usage | "main", "advanced", "simple" |
| `trackEventClick()` | `eventName, roomName` | Track calendar event clicks | Event selection |
| `trackRoomSearch()` | `searchTerm, resultsCount` | Track search behavior | Search queries |
| `trackError()` | `error, context` | Track JavaScript errors | Error monitoring |
| `trackSessionEnd()` | None | Track session duration | On page unload |

#### 2. analytics-dashboard.html

**Location**: `/analytics-dashboard.html`
**Purpose**: Visualization dashboard for analytics data
**Status**: Currently displaying mock data with "Setup Required" messages

**Features**:
- Time range selector (7d, 30d, 90d, 1y)
- Visitor statistics cards
- Room views bar chart
- Peak hours chart
- View mode preferences chart

**Current State**:
- Shows placeholder data
- Displays setup instructions
- Designed for future API integration

#### 3. index.html (Main Dashboard)

**Modifications**:

1. **Analytics Script Integration** (Line 2293):
   ```html
   <script src="analytics.js"></script>
   ```

2. **Analytics Button** (Line 2328):
   ```html
   <button class="analytics-btn" onclick="window.location.href='analytics-dashboard.html'">Analytics</button>
   ```

3. **Tracking in switchView()** (Line 3768-3782):
   ```javascript
   switchView(viewType) {
       const oldView = this.currentView;
       this.currentView = viewType;

       // Track view mode change
       if (window.BattenAnalytics && oldView !== viewType) {
           window.BattenAnalytics.trackViewModeChange(oldView, viewType);
       }
       // ... rest of function
   }
   ```

4. **Tracking in init()** (Line 3204-3207):
   ```javascript
   // Track dashboard view
   if (window.BattenAnalytics) {
       window.BattenAnalytics.trackDashboardView('main');
   }
   ```

#### 4. staticwebapp.config.json

**Content Security Policy Updates** (Line 28):

Added domains required for Application Insights:
```json
"Content-Security-Policy": "default-src 'self' ... https://js.monitor.azure.com https://*.in.applicationinsights.azure.com https://*.livediagnostics.monitor.azure.com https://dc.services.visualstudio.com ..."
```

**Critical Domains**:
- `https://js.monitor.azure.com` - SDK script source
- `https://*.in.applicationinsights.azure.com` - Data ingestion
- `https://*.livediagnostics.monitor.azure.com` - Live metrics
- `https://dc.services.visualstudio.com` - Telemetry endpoint (required for data transmission)

#### 5. Azure Functions (api/)

**Created for App Insights Integration**:

Azure Static Web Apps require at least one function to enable Application Insights integration.

**Files**:
- `api/HealthCheck/index.js` - Simple health check endpoint
- `api/HealthCheck/function.json` - Function binding configuration
- `api/host.json` - Application Insights configuration
- `api/package.json` - Dependencies

**Health Check Endpoint**:
```
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": "2025-11-20T...",
  "message": "BattenSpace API is running",
  "version": "1.0.0"
}
```

## Tracked Events

### 1. DashboardViewed

**When**: User opens any dashboard page
**Properties**:
- `dashboardType`: "main" | "advanced" | "simple" | "basic"
- `timestamp`: ISO 8601 timestamp

**Implementation**:
```javascript
window.BattenAnalytics.trackDashboardView('main');
```

**Query**:
```kusto
customEvents
| where name == "DashboardViewed"
| summarize count() by tostring(customDimensions.dashboardType)
```

### 2. ViewModeChanged

**When**: User switches between day/week/month views
**Properties**:
- `fromMode`: Previous view mode
- `toMode`: New view mode
- `timestamp`: ISO 8601 timestamp

**Implementation**:
```javascript
window.BattenAnalytics.trackViewModeChange('day', 'week');
```

**Query**:
```kusto
customEvents
| where name == "ViewModeChanged"
| summarize switches = count() by
    from = tostring(customDimensions.fromMode),
    to = tostring(customDimensions.toMode)
```

### 3. RoomViewed

**When**: User views a specific room
**Properties**:
- `roomName`: Name of the room
- `viewMode`: Current view mode (day/week/month)
- `dayOfWeek`: Day of week
- `hour`: Hour of day (0-23)
- `timestamp`: ISO 8601 timestamp

**Implementation**:
```javascript
window.BattenAnalytics.trackRoomView('Great Hall 100', 'day');
```

**Query - Most Popular Rooms**:
```kusto
customEvents
| where name == "RoomViewed"
| summarize views = count() by tostring(customDimensions.roomName)
| order by views desc
| take 10
```

### 4. EventClicked

**When**: User clicks on a calendar event
**Properties**:
- `eventName`: Name/title of the event
- `roomName`: Room where event is scheduled
- `timestamp`: ISO 8601 timestamp

**Implementation**:
```javascript
window.BattenAnalytics.trackEventClick('Team Meeting', 'Conference Room A');
```

### 5. RoomSearched

**When**: User performs a room search
**Properties**:
- `searchTerm`: Search query
- `resultsCount`: Number of results found
- `timestamp`: ISO 8601 timestamp

**Implementation**:
```javascript
window.BattenAnalytics.trackRoomSearch('conference', 5);
```

### 6. Error

**When**: JavaScript error occurs
**Properties**:
- `message`: Error message
- `context`: JSON stringified context object
- `timestamp`: ISO 8601 timestamp

**Implementation**:
```javascript
window.BattenAnalytics.trackError(error, { component: 'calendar-parser' });
```

### 7. SessionDuration (Metric)

**When**: User closes/leaves the page
**Properties**:
- `average`: Session duration in seconds
- `timestamp`: ISO 8601 timestamp

**Implementation**:
```javascript
// Automatically tracked on beforeunload event
window.addEventListener('beforeunload', () => {
    window.BattenAnalytics.trackSessionEnd();
});
```

**Query**:
```kusto
customMetrics
| where name == "SessionDuration"
| summarize avg(value), percentile(value, 50), percentile(value, 95)
```

## Configuration

### Azure Application Insights Resource

**Resource Details**:
- **Name**: (Created by user in Azure Portal)
- **Instrumentation Key**: `99b03178-5fa4-40a6-8d6c-9023f5dca71b`
- **Region**: East US
- **Connection String**: `InstrumentationKey=99b03178-5fa4-40a6-8d6c-9023f5dca71b;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=257499d4-cd1b-4fca-a59c-2ea2b162bb0e`

### SDK Configuration

**Auto-enabled Features**:
- `enableAutoRouteTracking: true` - Track SPA navigation
- `disableFetchTracking: false` - Track HTTP requests
- `enableCorsCorrelation: true` - Track cross-origin requests
- `enableRequestHeaderTracking: true` - Include request headers
- `enableResponseHeaderTracking: true` - Include response headers
- `autoTrackPageVisitTime: true` - Track time on page
- `disableAjaxTracking: false` - Track AJAX calls

### Deployment Configuration

**GitHub Actions Workflow** (`.github/workflows/azure-static-web-apps-gentle-pond-0fb82ed10.yml`):
```yaml
api_location: "api"  # Azure Functions location
```

**Static Web App Config** (`staticwebapp.config.json`):
- CSP headers configured
- Routes allow anonymous/authenticated access
- Azure AD authentication enabled

## Data Access

### Azure Portal

**Navigate to**: Azure Portal → Application Insights → [Your Resource]

#### 1. Live Metrics

**Path**: Overview → Live Metrics
**View**: Real-time telemetry data
**Use Cases**: Debugging, monitoring active sessions

#### 2. Logs (Kusto Queries)

**Path**: Monitoring → Logs
**Language**: Kusto Query Language (KQL)

**Common Queries**:

**Total Events by Type**:
```kusto
customEvents
| where timestamp > ago(7d)
| summarize count() by name
| order by count_ desc
```

**Unique Users (Approximation)**:
```kusto
pageViews
| where timestamp > ago(7d)
| summarize dcount(user_Id)
```

**Peak Usage Hours**:
```kusto
customEvents
| where timestamp > ago(7d)
| extend hour = datetime_part("hour", timestamp)
| summarize events = count() by hour
| order by hour asc
```

**Room Popularity Over Time**:
```kusto
customEvents
| where name == "RoomViewed"
| where timestamp > ago(30d)
| summarize views = count() by
    room = tostring(customDimensions.roomName),
    day = bin(timestamp, 1d)
| order by day asc
```

**Error Tracking**:
```kusto
customEvents
| where name == "Error"
| project
    timestamp,
    message = tostring(customDimensions.message),
    context = tostring(customDimensions.context)
| order by timestamp desc
```

#### 3. Application Dashboard

**Path**: Overview → Application Dashboard
**Features**: Pre-built visualizations of key metrics

### Analytics Dashboard (In-App)

**Access**: Click "Analytics" button in main dashboard header
**Current State**: Displays mock data with setup instructions
**Future**: Will integrate with Azure Application Insights API

**Time Ranges Available**:
- Last 7 Days
- Last 30 Days
- Last 90 Days
- Last Year

**Metrics Displayed**:
1. Total Visitors
2. Unique Visitors
3. Returning Visitors
4. Average Session Duration
5. Most Viewed Rooms (bar chart)
6. Peak Usage Hours (bar chart)
7. View Mode Preferences (bar chart)

## Troubleshooting

### Issue: Analytics not loading

**Symptoms**: Console shows "Application Insights key not configured"

**Solutions**:
1. Check `analytics.js` line 16 has correct instrumentation key
2. Verify deployment completed successfully
3. Hard refresh browser (Ctrl+F5)

### Issue: CSP blocking SDK

**Symptoms**: Console error "violates the following Content Security Policy directive"

**Solutions**:
1. Check `staticwebapp.config.json` includes all required domains:
   - `https://js.monitor.azure.com`
   - `https://*.in.applicationinsights.azure.com`
   - `https://*.livediagnostics.monitor.azure.com`
   - `https://dc.services.visualstudio.com`
2. Redeploy application
3. Clear browser cache

### Issue: No data in Azure Portal

**Symptoms**: Queries return empty results after 10+ minutes

**Solutions**:
1. Check console for successful SDK load message
2. Verify instrumentation key is correct
3. Check Live Metrics for real-time data
4. Ensure users have actually visited the site
5. Try query: `customEvents | take 10` to see if ANY events exist

### Issue: SDK loads but no data transmitted

**Symptoms**: "SDK loaded successfully" but CSP error for dc.services.visualstudio.com

**Solution**: Add `https://dc.services.visualstudio.com` to CSP (already done)

### Verification Checklist

- [ ] Console shows "📊 Analytics: Application Insights SDK loaded successfully"
- [ ] No CSP errors in console
- [ ] No 404 errors for analytics.js
- [ ] Live Metrics shows activity (if users are active)
- [ ] Kusto query returns events after 5-10 minutes

## Future Enhancements

### Phase 1: Real Data Integration

**Goal**: Connect analytics dashboard to Azure Application Insights API

**Implementation**:
1. Create Azure Function to query Application Insights API
2. Update `analytics-dashboard.html` to fetch real data
3. Replace "Setup Required" messages with actual statistics
4. Add authentication for API access

**Files to Modify**:
- `api/GetAnalytics/index.js` (new)
- `analytics-dashboard.html` (update data fetching)
- `analytics.js` (add `getAnalyticsData()` implementation)

### Phase 2: Advanced Visualizations

**Features**:
- Interactive charts with Chart.js or D3.js
- Date range picker with custom ranges
- Export data to CSV/Excel
- Room comparison views
- Heat maps for usage patterns

### Phase 3: Alerts & Notifications

**Features**:
- Email alerts for errors
- Usage threshold notifications
- Weekly analytics reports
- Anomaly detection

### Phase 4: User Segmentation

**Features**:
- Track user roles (staff vs. community)
- Department-level analytics
- User journey mapping
- Cohort analysis

## Privacy & Compliance

### Data Collection Policy

**What is Collected**:
- Anonymous usage patterns
- Browser/device type
- Geographic region (not precise location)
- Usage times and patterns
- Room viewing preferences

**What is NOT Collected**:
- Names or email addresses
- Precise location data
- Personal calendar information
- Authentication tokens
- IP addresses (logged by Azure but not exposed)

### GDPR Compliance

Application Insights is GDPR compliant:
- No PII is collected by default
- Data retention: 90 days (configurable)
- Data can be deleted upon request
- Located in East US (Azure region)

### Data Retention

**Default**: 90 days
**Configurable**: 30-730 days
**Location**: Azure Portal → Application Insights → Usage and estimated costs → Data Retention

## Cost Estimation

### Pricing Tier

**Free Tier**:
- First 5 GB/month: Free
- After 5 GB: $2.30 per GB

### Expected Usage

**Low Traffic** (<1000 visits/day):
- Estimated data: ~500 MB/month
- **Cost**: $0/month (within free tier)

**Medium Traffic** (1000-10000 visits/day):
- Estimated data: 2-8 GB/month
- **Cost**: $0-7/month

**High Traffic** (>10000 visits/day):
- Estimated data: 10-30 GB/month
- **Cost**: $12-58/month

### Monitoring Costs

**Path**: Azure Portal → Application Insights → Usage and estimated costs

**Alerts**: Set up cost alerts at $5, $10, $20 thresholds

## Support & References

### Documentation Links

- [Application Insights JavaScript SDK](https://docs.microsoft.com/azure/azure-monitor/app/javascript)
- [Kusto Query Language](https://docs.microsoft.com/azure/data-explorer/kusto/query/)
- [Application Insights Sampling](https://docs.microsoft.com/azure/azure-monitor/app/sampling)

### Internal Documentation

- [ANALYTICS-SETUP.md](ANALYTICS-SETUP.md) - Setup guide for enabling analytics
- [CLAUDE.md](CLAUDE.md) - Project development guide
- [staticwebapp.config.json](staticwebapp.config.json) - CSP configuration

### Contact

- **Developer**: Ben Hartless (bh4hb@virginia.edu)
- **Analytics Questions**: Check Azure Portal → Application Insights → Logs
- **Repository**: https://github.com/behartless67-a11y/room-booking-v2

---

**Document Version**: 1.0
**Last Updated**: November 20, 2025
**Next Review**: January 2026
