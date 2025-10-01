# RoomTool Deployment Updates

## Overview
This document outlines the major updates made to the RoomTool on September 5-6, 2025 to resolve calendar refresh issues and implement a robust Azure-based caching system.

## Problem Solved
The original RoomTool had calendar refresh issues where Outlook calendar shared links would become stale or fail to load, causing "Could not load calendar data" errors.

## Solution Implemented

### 1. Azure Function Calendar Caching System
Created a comprehensive Azure Function app (`roomtool-calendar-function`) with multiple endpoints:

#### Functions Created:
- **CalendarRefresh** (Timer Trigger): Automatically refreshes all calendar data every 15 minutes
- **GetCalendar** (HTTP Trigger): Serves cached calendar data to the web app
- **ManualRefresh** (HTTP Trigger): Manual calendar refresh for testing
- **DebugStatus** (HTTP Trigger): Debug endpoint to check system status

#### Room Mapping:
The system caches 7 room calendars:
- `confa` - Conference Room A L014
- `greathall` - Great Hall 100  
- `seminar` - Seminar Room L039
- `pavx-upper` - Pavilion X Upper Garden
- `pavx-b1` - Pavilion X Basement Room 1
- `pavx-b2` - Pavilion X Basement Room 2  
- `pavx-exhibit` - Pavilion X Basement Exhibit

### 2. Configuration Updates

#### config.js Changes:
- Added `azureFunctionUrl: "https://roomtool-calendar-function.azurewebsites.net/api/getcalendar"`
- Updated all room `icsFile` values from full URLs to simple room IDs
- Removed problematic Student Lounge room that had no corresponding calendar

#### Example Before/After:
```javascript
// Before
icsFile: "https://outlook.office365.com/owa/calendar/4207f27aa0d54d318d660537325a3856@virginia.edu/..."

// After  
icsFile: "confa"
```

### 3. JavaScript Integration Updates

#### index.html Changes:
- Enhanced calendar loading logic to detect room IDs vs. full URLs
- Added Azure Function API integration:
  ```javascript
  if (this.config.azureFunctionUrl && !fileName.includes('/') && !fileName.includes('.ics')) {
      fetchUrl = `${this.config.azureFunctionUrl}?room=${fileName}`;
  }
  ```

### 4. Azure Static Web App Deployment

#### New Deployment URL: 
`https://nice-dune-0d695b810.2.azurestaticapps.net/`

#### GitHub Actions Workflow:
- Updated deployment token for Azure Static Web Apps
- Configured proper build settings for static HTML deployment

### 5. CORS Configuration
- Configured Azure Function App CORS settings to allow requests from the Static Web App domain
- This resolves cross-origin request issues that were blocking calendar data loading

## Technical Architecture

### Data Flow:
1. **Timer Trigger** (every 15 minutes):
   - CalendarRefresh function fetches all 7 calendar URLs
   - Stores calendar data in Azure Blob Storage container `calendar-cache`
   - Each room's data stored as `{room-id}.ics` with metadata

2. **Web App Request**:
   - User visits RoomTool
   - JavaScript loads config.js with room IDs
   - For each room, calls `getcalendar?room={id}`
   - GetCalendar function serves cached data from blob storage
   - Calendar events display in real-time

3. **Backup/Manual Refresh**:
   - ManualRefresh endpoint available for immediate cache updates
   - DebugStatus provides system health monitoring

## Files Modified

### Core Configuration:
- `config.js` - Updated room configuration and Azure Function integration
- `index.html` - Enhanced JavaScript for Azure Function API calls

### Azure Function Code:
- `CalendarRefresh/__init__.py` - Timer-triggered refresh logic
- `GetCalendar/__init__.py` - HTTP API for serving cached calendars  
- `ManualRefresh/__init__.py` - Manual refresh endpoint
- `DebugStatus/__init__.py` - System debugging endpoint
- `host.json` - Azure Function host configuration
- All `function.json` files - Function binding configurations

### Deployment:
- `.github/workflows/azure-static-web-apps.yml` - GitHub Actions deployment
- `azure-function/host.json` - Function app configuration

## Deployment Commands Used

### Azure Function Deployment:
```bash
export PATH="/Users/markoutten/Library/Python/3.9/bin:$PATH"
cd azure-function
func azure functionapp publish roomtool-calendar-function --python
```

### Static Web App Deployment:
Automatic via GitHub Actions when pushing to main branch.

## API Endpoints

### Azure Function App Base URL:
`https://roomtool-calendar-function.azurewebsites.net/api/`

### Endpoints:
- `GET /getcalendar?room={room-id}` - Get cached calendar for specific room
- `GET /manualrefresh` - Manually refresh all calendars
- `GET /debugstatus` - System status and diagnostic info

## Testing Commands

### Test Calendar API:
```bash
curl "https://roomtool-calendar-function.azurewebsites.net/api/getcalendar?room=confa"
```

### Test Manual Refresh:
```bash
curl "https://roomtool-calendar-function.azurewebsites.net/api/manualrefresh"
```

### Test Live Site:
Visit: `https://nice-dune-0d695b810.2.azurestaticapps.net/`

## Monitoring & Maintenance

### Automatic Refresh:
- Calendars refresh every 15 minutes via timer trigger
- No manual intervention required under normal operation

### Manual Refresh:
- Use ManualRefresh endpoint if immediate update needed
- DebugStatus endpoint provides system health information

### Troubleshooting:
- Check Azure Function logs in Azure Portal
- Use DebugStatus endpoint to verify blob storage and cache status
- Manual refresh can resolve temporary issues

## Security Notes
- All Azure Function endpoints use anonymous authentication (as required for web app access)
- CORS configured specifically for the Static Web App domain
- Calendar data cached in private Azure Blob Storage container

## Deployment Workflow

### IMPORTANT: Git Push Auto-Deployment
**All changes to the codebase automatically deploy to Azure Static Web Apps when pushed to GitHub.**

#### Standard Deployment Process:
```bash
# 1. Make changes to files (index.html, config.js, etc.)

# 2. Stage and commit changes
git add .
git commit -m "Description of changes"

# 3. Push to GitHub main branch
git push origin main
```

#### What Happens Automatically:
1. **GitHub Actions Workflow Triggers** (`.github/workflows/azure-static-web-apps.yml`)
2. **Azure Static Web Apps Deployment** begins (~2-3 minutes)
3. **Live Site Updated** at https://nice-dune-0d695b810.2.azurestaticapps.net/
4. **Zero downtime** - smooth transition to new version

#### Monitoring Deployment:
- **GitHub**: Check Actions tab for workflow status
- **Azure Portal**: Static Web Apps → Deployments section
- **Live Site**: Changes appear within 2-3 minutes of push

### Azure Function Updates (Separate Process)
Azure Functions require manual deployment:
```bash
cd azure-function
func azure functionapp publish roomtool-calendar-function --python
```

## Future Improvements
- Consider implementing authentication for manual refresh endpoint
- Add monitoring alerts for failed calendar refreshes
- Implement cache expiration policies
- Add more detailed logging and error handling

---
*Last updated: October 1, 2025*
*System Status: ✅ Fully Operational*