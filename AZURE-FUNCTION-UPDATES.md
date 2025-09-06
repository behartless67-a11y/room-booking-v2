# Azure Function Integration - September 2025 Updates

## Summary
Implemented Azure Function calendar caching system to resolve calendar refresh issues.

## Key Changes

### 1. Azure Function App: `roomtool-calendar-function`
- **CalendarRefresh**: Timer trigger (every 15 min) - caches all 7 room calendars
- **GetCalendar**: HTTP API endpoint - serves cached calendar data  
- **ManualRefresh**: Manual refresh endpoint for testing
- **DebugStatus**: System diagnostics

### 2. Configuration Updates
- **config.js**: Added `azureFunctionUrl`, converted room URLs to IDs
- **index.html**: Enhanced JavaScript for Azure Function API integration
- **Room mapping**: 7 rooms (confa, greathall, seminar, pavx-upper, pavx-b1, pavx-b2, pavx-exhibit)

### 3. Deployment Updates
- **New Static Web App URL**: https://nice-dune-0d695b810.2.azurestaticapps.net/
- **Azure Function URL**: https://roomtool-calendar-function.azurewebsites.net/api/
- **CORS configured** for cross-origin requests

## Technical Flow
1. Timer refreshes calendars → Azure Blob Storage cache
2. Web app requests calendar data via room ID
3. Azure Function serves cached data with CORS headers
4. Real-time calendar display without refresh issues

## Testing
- Manual refresh: `curl https://roomtool-calendar-function.azurewebsites.net/api/manualrefresh`
- Calendar API: `curl https://roomtool-calendar-function.azurewebsites.net/api/getcalendar?room=confa`
- Live site: https://nice-dune-0d695b810.2.azurestaticapps.net/

## Result
✅ Calendar events now display reliably with automatic 15-minute refresh cycle
✅ No more "Could not load calendar data" errors
✅ Robust caching system with fallback options