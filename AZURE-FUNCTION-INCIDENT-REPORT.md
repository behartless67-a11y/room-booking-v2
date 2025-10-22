# Azure Function Incident Report - October 21, 2025

## Summary
The Azure Function App (`roomtool-calendar-function`) became completely non-functional after attempting to add Out of Office calendar support. All room calendars stopped loading, returning 500 Internal Server errors. Resolution required creating a new Function App.

---

## What We Were Trying To Do

### Original Goal: Add Out of Office Calendar Feature
- User requested adding an "Out of Office" (OOO) calendar display to the BattenSpace dashboard
- Feature requirements:
  - Display staff who are out of office TODAY in a footer section
  - Add button to let users add themselves to OOO calendar
  - Fetch OOO data from: `webcal://www.trumba.com/calendars/staff-ooo.ics`
  - Use same Azure Function caching architecture as room calendars

### Implementation Approach
We attempted to add the OOO calendar to the existing Azure Function by:
1. Adding `'https://www.trumba.com/calendars/staff-ooo.ics'` to the `calendar_urls` list in `CalendarRefresh/__init__.py`
2. Adding `'staff-ooo': 'staff-ooo'` to the `room_mapping` dictionary
3. Updating frontend to fetch from Azure Function endpoint with `?calendar=staff-ooo`

---

## What Went Wrong

### Timeline of Events

#### 1. Initial Deployment (Added staff-ooo to CalendarRefresh/__init__.py)
- **Result**: CATASTROPHIC FAILURE
- **Symptoms**: All calendars returned 500 Internal Server errors
- **Error Message**: "Could not load calendar data from any of the specified files: confa, greathall, seminar, studentlounge206, pavx-upper, pavx-b1, pavx-b2, pavx-exhibit"
- **Impact**: Complete site outage - NO room calendars working

#### 2. First Rollback Attempt
- **Action**: Used `git checkout df6031d -- azure-function/CalendarRefresh/__init__.py` to restore working code
- **Created**: `azure-function-rollback.zip`
- **Deployed**: Via `az functionapp deployment source config-zip`
- **Result**: FAILED - Still returning 500 errors

#### 3. Second Rollback Attempt
- **Action**: Created clean deployment from git history using `git archive`
- **Created**: `azure-function-CLEAN.zip` with only CalendarRefresh and GetCalendar
- **Deployed**: Successfully (deployment status showed "complete": true, "status": 4)
- **Restarted**: Function App via `az functionapp restart`
- **Result**: STILL FAILED - Same 500 errors persisted

#### 4. Root Cause Discovery
After successful rollback deployment, we investigated why errors persisted:

**Finding #1: CalendarRefresh Never Executed**
- Checked Invocations history - ZERO executions since deployment
- Cache was empty because timer function never ran
- GetCalendar returned 500 because it couldn't find cached data in blob storage

**Finding #2: Missing Helper Functions**
- Examined `azure-function-CLEAN.zip` contents
- Only contained: CalendarRefresh, GetCalendar, host.json, requirements.txt
- Missing functions:
  - **ManualRefresh** (HTTP trigger to manually populate cache)
  - **DebugStatus** (diagnostic helper)
  - **TestFunction** (testing helper)
  - **GetUserRoles** (authentication helper)

**Finding #3: Deployment Permission Issues**
- Azure CLI deployment initially worked
- Mid-troubleshooting, started getting AuthorizationFailed errors:
  - Error: "The client 'bh4hb@virginia.edu' does not have authorization to perform action 'Microsoft.Web/sites/read'"
- Even after `az logout` and `az login`, permissions remained broken
- Portal-based deployments also failed with "Failed to set up deployment"

**Finding #4: No Way to Trigger Cache Population**
- CalendarRefresh is timer-based (runs every 15 minutes)
- No manual trigger capability without ManualRefresh function
- Portal "Test/Run" functionality not accessible
- Kudu console had limited functionality, no Tools menu for Zip Deploy

---

## Why Rollback Failed

The rollback deployed working code, but the Function App remained broken because:

1. **Empty Cache**: CalendarRefresh timer hadn't triggered yet (or was failing silently)
2. **No Manual Override**: ManualRefresh function was missing, so couldn't manually populate cache
3. **Incomplete Deployment**: Only deployed 2 of 6 functions, removing debugging/helper capabilities
4. **No Diagnostic Access**: Couldn't view actual error logs or trigger functions manually

Even though the code was correct, the infrastructure was in a broken state with no way to fix it remotely.

---

## Attempted Solutions (All Failed)

### Solution 1: Deploy Complete Function Package
- **Attempt**: Created `azure-function-complete.zip` with all 6 functions
- **Blocker**: Azure CLI permissions revoked mid-session
- **Result**: AuthorizationFailed error

### Solution 2: Azure Portal Deployment Center
- **Attempt**: Upload ZIP via Deployment Center interface
- **Blocker**: "Failed to set up deployment" error
- **Result**: Could not save deployment settings

### Solution 3: Kudu Zip Deploy
- **Attempt**: Access Kudu console at `https://roomtool-calendar-function.scm.azurewebsites.net`
- **Issue**: Kudu homepage showed no navigation menu, only static info
- **Attempt**: Try `/api/zipdeploy` endpoint
- **Result**: "No route registered for '/api/zipdeploy'"

### Solution 4: Manual Function Trigger
- **Attempt**: Trigger CalendarRefresh via Portal UI
- **Issue**: No Test/Run button accessible for timer functions
- **Result**: No way to manually populate cache

### Solution 5: Direct File Editing
- **Attempt**: Use Portal "Code + Test" to edit functions
- **Blocker**: "This function has been edited through an external editor. Portal editing is disabled."
- **Result**: Cannot edit code directly

---

## Resolution: Create New Function App

### Why This Was Necessary
- Old Function App was in corrupted state with empty cache and no way to populate it
- Deployment infrastructure broken (both CLI and Portal)
- Missing critical helper functions (especially ManualRefresh)
- No diagnostic access to determine actual root cause
- Faster to start fresh than continue debugging broken infrastructure

### New Function App Details
- **Name**: `RoomCalendarFunction`
- **Resource Group**: RoomTool
- **Runtime**: Python 3.11
- **OS**: Linux
- **Region**: East US
- **Plan**: Consumption (Serverless)
- **Deployment**: `azure-function-complete.zip` with all 6 functions

### Post-Creation Steps Required
1. Deploy complete function package immediately (while credentials valid)
2. Verify all 6 functions deployed successfully
3. Manually trigger ManualRefresh to populate cache: `https://RoomCalendarFunction.azurewebsites.net/api/ManualRefresh`
4. Update frontend config.js to point to new Function URL
5. Test all room calendars load correctly
6. Delete old broken Function App (`roomtool-calendar-function`)

---

## Lessons Learned

### What Caused the Original Failure
**Hypothesis**: Adding the staff-ooo calendar to CalendarRefresh likely caused one of:
1. Network timeout fetching Trumba calendar (different domain than Outlook)
2. ICS format incompatibility between Trumba and Outlook calendars
3. Blob storage permission issue when trying to create staff-ooo.ics
4. Exception in calendar processing that crashed the entire function

**Why it broke ALL calendars**: CalendarRefresh processes all calendars in a loop. If one calendar throws an unhandled exception early in the process, it could crash before caching any calendars, leaving blob storage empty.

### Critical Mistakes Made
1. **No Testing Environment**: Deployed directly to production Function App
2. **Incomplete Rollback Package**: First rollback only included 2 of 6 functions
3. **No Monitoring**: Couldn't access Application Insights or detailed logs to see actual error
4. **Over-reliance on Single Function**: Should have had ManualRefresh deployed from the start
5. **Insufficient Error Handling**: CalendarRefresh should handle individual calendar failures without crashing entire function

### Prevention Strategies
1. **Always Deploy Complete Package**: Never deploy partial function sets
2. **Include ManualRefresh**: Critical for emergency cache population
3. **Test Additions Separately First**: Don't add new calendars directly to production loop
4. **Better Error Handling**: Wrap each calendar fetch in try/catch to isolate failures
5. **Staging Environment**: Test deployments in separate Function App before production
6. **Monitor Application Insights**: Set up alerts for function failures
7. **Document Helper Functions**: Ensure all team members know about ManualRefresh endpoint

---

## Next Steps for OOO Feature

### Safe Implementation Approach
1. **First**: Get new Function App stable with existing 8 room calendars
2. **Create Separate Function**: Add new `GetOutOfOffice` HTTP function instead of modifying CalendarRefresh
3. **Fetch OOO On-Demand**: Instead of caching, fetch Trumba calendar directly when requested
4. **Add Caching Later**: Only after confirming Trumba calendar works reliably
5. **Test Thoroughly**: Use TestFunction or create staging Function App

### Alternative Architecture for OOO
Instead of adding to CalendarRefresh, create dedicated OOO function:

```python
# GetOutOfOffice/__init__.py
def main(req: func.HttpRequest) -> func.HttpResponse:
    # Fetch Trumba calendar directly
    # No caching initially - simpler and safer
    # Cache can be added later after confirming reliability
```

Benefits:
- Isolated failure domain (won't break room calendars)
- Easier to debug
- Can test independently
- Different caching strategy if needed

---

## Files Affected

### Modified Files (Reverted)
- `azure-function/CalendarRefresh/__init__.py` - Added staff-ooo (REVERTED)
- `index.html` - Added OOO footer HTML and CSS (KEPT)
- `config.js` - Added outOfOfficeCalendar config (KEPT)

### Deployment Artifacts Created
- `azure-function-rollback.zip` - First rollback attempt (incomplete)
- `azure-function-CLEAN.zip` - Clean deployment from git (incomplete - only 2 functions)
- `azure-function-complete.zip` - Full deployment with all 6 functions (CORRECT)

### Git History
- Commit `df6031d` - Last known working state (before staff-ooo addition)
- No commits made during incident (changes not committed)
- Frontend changes (OOO footer) committed separately

---

## Current Status

### Working
- Frontend has OOO footer UI ready (HTML/CSS/JS complete)
- Complete function package created with all 6 functions
- New Function App created and ready for deployment

### Pending
- Deploy `azure-function-complete.zip` to new Function App
- Trigger ManualRefresh to populate cache
- Update frontend to use new Function URL
- Test all calendars working
- Implement OOO feature using safe approach

### Abandoned
- Old Function App `roomtool-calendar-function` (to be deleted after verification)

---

## Incident Duration
- **Start**: October 21, 2025 ~8:00 PM (when staff-ooo deployment broke everything)
- **Resolution Started**: October 21, 2025 ~10:30 PM (new Function App created)
- **Total Outage**: ~2.5 hours of all calendars being broken

---

## Technical Reference

### Azure Function Architecture
```
┌─────────────────────────────────────────────┐
│  CalendarRefresh (Timer - every 15 min)     │
│  - Fetches 8 Outlook calendar URLs          │
│  - Stores in Azure Blob Storage             │
│  - Creates cache with 15-min TTL            │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Azure Blob Storage (calendar-cache)        │
│  - confa.ics                                │
│  - greathall.ics                            │
│  - seminar.ics                              │
│  - studentlounge206.ics                     │
│  - pavx-upper.ics                           │
│  - pavx-b1.ics                              │
│  - pavx-b2.ics                              │
│  - pavx-exhibit.ics                         │
│  - refresh-summary.json                     │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  GetCalendar (HTTP - GET)                   │
│  - Reads from blob storage                  │
│  - Returns cached ICS with CORS headers     │
│  - Called by frontend: ?room=confa          │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Frontend (Static Web App)                  │
│  - Fetches calendar data via GetCalendar    │
│  - Parses ICS and displays events           │
│  - Updates every 15 minutes                 │
└─────────────────────────────────────────────┘
```

### Why This Architecture?
1. **CORS Workaround**: Outlook calendars don't set CORS headers, Function App adds them
2. **Performance**: Cache reduces calls to Outlook (rate limiting)
3. **Reliability**: If Outlook slow/down, cache provides stale data rather than errors
4. **Cost**: Fewer external HTTP calls

### Critical Components
- **CalendarRefresh**: Must run successfully to populate cache
- **Blob Storage**: Must be accessible with valid connection string
- **GetCalendar**: Returns 404/500 if cache empty
- **ManualRefresh**: Emergency cache population (HTTP endpoint)

---

## Contact & Escalation
- **User**: bh4hb@virginia.edu
- **Subscription**: ba-ss-prod-1
- **Resource Group**: RoomTool
- **Region**: East US

If similar issues occur:
1. Check Application Insights for actual errors
2. Use ManualRefresh endpoint to repopulate cache
3. Don't panic-deploy partial packages
4. Create new Function App if infrastructure corrupted
5. Document everything in incident report
