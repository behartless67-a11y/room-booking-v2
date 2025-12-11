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

## October 20, 2025 - APPExplorer Design System Integration

### Overview
Complete redesign of BattenSpace to match APPExplorer's sophisticated design aesthetic, including typography updates, background treatment, and significantly wider layout to display more rooms simultaneously.

### Design System Changes

#### 1. Typography Overhaul
**Before:**
- Primary font: Segoe UI (sans-serif)
- Secondary font: Crimson Text

**After:**
- **Primary font**: Libre Baskerville (serif) - Elegant, sophisticated serif for body text
- **Secondary font**: Inter (sans-serif) - Clean, modern sans-serif for UI elements, labels, and buttons
- Google Fonts integration: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap`

**Impact:** Creates a more sophisticated, professional appearance that matches APPExplorer's brand aesthetic.

#### 2. Background Treatment
**Implementation:**
- Added `garrett-hall-sunset.jpg` (1.4MB, 2000x1333px JPEG)
- **Grayscale effect**: 100% filter applied via CSS pseudo-element
- **White overlay**: 85% opacity (`rgba(255, 255, 255, 0.85)`)
- **Fixed positioning**: Background doesn't scroll with content
- **Layered approach**: Uses `body::before` and `body::after` pseudo-elements for professional multi-layer effect

**CSS Architecture:**
```css
body {
    background: linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)),
                url('/garrett-hall-sunset.jpg');
    background-attachment: fixed;
}

body::before {
    background-image: url('/garrett-hall-sunset.jpg');
    filter: grayscale(100%);
    z-index: -2;
}

body::after {
    background: rgba(255, 255, 255, 0.85);
    z-index: -1;
}
```

#### 3. Layout Width Increase
**Before:** `max-width: 1400px`
**After:** `max-width: 1840px`

**Impact:**
- 31% increase in available width (440px additional space)
- Allows significantly more room columns to display in grid view
- Better utilization of modern widescreen displays
- Improved user experience for viewing multiple rooms simultaneously

#### 4. CSS Variables & Design System
Added comprehensive CSS variable system for consistency:

```css
:root {
    --brand-bg: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
    --brand-card: #FFFFFF;
    --brand-border: #E2E8F0;
    --brand-text: #232D4B;
    --brand-muted: #64748B;
    --brand-accent: #E57200;
    --brand-accent-hover: #FF8C00;
    --brand-header-bg: linear-gradient(135deg, #1E293B 0%, #232D4B 100%);
    --brand-header-text: #FFFFFF;
    --radius: 16px;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

#### 5. Enhanced UI Components

**Buttons:**
- Added gradient backgrounds: `linear-gradient(135deg, var(--brand-accent) 0%, var(--brand-accent-hover) 100%)`
- Hover effects: `translateY(-2px)` with shadow elevation
- Border radius increased: `5px → 8px`
- Padding updated: `10px 20px → 12px 24px`

**Cards:**
- Border radius: `8px → 16px` (var(--radius))
- Enhanced shadows: var(--shadow) with hover upgrade to var(--shadow-lg)
- Hover animation: `transform: translateY(-2px)`

**Form Inputs:**
- Focus state: 2px solid orange outline with `box-shadow: 0 0 0 3px rgba(229, 114, 0, 0.1)`
- Border style: `2px solid #ddd → 1px solid var(--brand-border)`
- Border radius: `5px → 8px`

**Headers:**
- Applied navy gradient: var(--brand-header-bg)
- Added prominent shadow: var(--shadow-lg)
- Border radius: `24px 24px 0 0` (rounded top corners)

**Badges/Pills:**
- Full rounded corners: `border-radius: 999px`
- Gradient backgrounds matching accent colors
- Font family: Inter for clean, modern appearance

#### 6. Files Modified

**Core Stylesheets:**
- `styles.css` - Complete design system overhaul (261 lines changed, 125 insertions)
  - Added CSS variables
  - Updated all color references
  - Implemented new typography
  - Enhanced component styles

**HTML Files:**
- `index.html` - Updated fonts and background, increased container width
- `simple-dashboard.html` - Applied matching design system
- Both files updated with:
  - Google Fonts imports
  - Inline background styles
  - Container width increases

**Assets:**
- `garrett-hall-sunset.jpg` - New background image (1.4MB)

### Deployment Issues Resolved

#### Issue 1: Oryx Build Error
**Problem:** Azure Static Web Apps deployment failing with:
```
Error: Could not find either 'build' or 'build:azure' node under 'scripts' in package.json
```

**Cause:** Azure Oryx build system attempting to build a static HTML/CSS/JS site that doesn't require compilation.

**Solution:** Added `skip_app_build: true` to `.github/workflows/azure-static-web-apps.yml`:
```yaml
- name: Build And Deploy
  uses: Azure/static-web-apps-deploy@v1
  with:
    azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_ROOMTOOL }}
    repo_token: ${{ secrets.GITHUB_TOKEN }}
    action: "upload"
    app_location: "/"
    api_location: ""
    output_location: "/"
    skip_app_build: true  # ← Added this line
```

**Impact:** Deployment now skips unnecessary build step, faster deployment (no build time), direct file deployment to CDN.

#### Issue 2: Background Image Not Loading
**Problem:** Background image not visible on live Azure deployment despite being committed and deployed.

**Cause:** Relative path `./garrett-hall-sunset.jpg` not resolving correctly from both CSS files and inline HTML styles on Azure CDN.

**Solution:** Changed all image paths from relative to absolute:
- **Before:** `url('./garrett-hall-sunset.jpg')`
- **After:** `url('/garrett-hall-sunset.jpg')`

**Files Updated:**
- `styles.css` - 2 occurrences (body and body::before)
- `index.html` - 2 occurrences (inline styles)
- `simple-dashboard.html` - 2 occurrences (inline styles)

**Impact:** Background image now loads consistently across all dashboard views.

### Git Commits

#### Commit 1: Design System Implementation
**Hash:** `afd2631`
**Message:** "Apply APPExplorer design system and increase layout width"
**Changes:**
- 4 files changed
- 261 insertions, 125 deletions
- Added garrett-hall-sunset.jpg (new file)

#### Commit 2: Build Fix
**Hash:** `fac8876`
**Message:** "Fix Azure deployment build error - skip build step for static site"
**Changes:**
- 1 file changed (.github/workflows/azure-static-web-apps.yml)
- 1 insertion

#### Commit 3: Background Path Fix
**Hash:** `2330969`
**Message:** "Fix background image paths - use absolute path from root"
**Changes:**
- 3 files changed
- 6 insertions, 6 deletions

### Testing & Validation

**Deployment Timeline:**
- Initial push: Design system updates deployed
- Build error: Identified and resolved within 5 minutes
- Background fix: Deployed and verified working

**Live URLs:**
- Primary: https://nice-dune-0d695b810.2.azurestaticapps.net/
- Custom domains:
  - appexplorer.thebattenspace.org
  - www.thebattenspace.org

**Verified Working:**
- ✅ Garrett Hall background displays with grayscale effect
- ✅ Typography updated to Libre Baskerville/Inter
- ✅ Wider layout (1840px) displays more room columns
- ✅ All buttons, cards, and UI components using new design system
- ✅ Gradient effects and hover animations functional
- ✅ Consistent styling across all dashboard views
- ✅ Mobile responsive design maintained

### Design System Benefits

**Visual Improvements:**
- More sophisticated, professional appearance
- Consistent with APPExplorer branding
- Elegant serif typography for better readability
- Subtle, non-distracting background
- Modern gradient accents and smooth animations

**Functional Improvements:**
- 31% wider layout accommodates more information
- Better use of screen real estate on modern displays
- Improved visual hierarchy with enhanced shadows
- Clearer focus states for better accessibility
- Consistent design language across all pages

**Maintenance Benefits:**
- CSS variables enable easy theme updates
- Centralized color/shadow definitions
- Reusable component patterns
- Clear design system documentation

### Technical Architecture

**Font Loading Strategy:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap" rel="stylesheet">
```
- Uses `display=swap` for optimal loading performance
- Minimizes font weight variations to reduce load time
- System font fallbacks: Georgia (serif), system-ui (sans-serif)

**Background Image Strategy:**
- Fixed attachment prevents scrolling
- Pseudo-elements create layered effect
- Grayscale filter maintains brand consistency
- 85% white overlay ensures text readability

**Responsive Design:**
- Container width scales with viewport (max 1840px)
- Mobile breakpoints maintained at 768px
- Touch-friendly button sizes preserved
- Grid layouts adapt to smaller screens

### Browser Compatibility

**Tested and Working:**
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile Safari (iOS)
- Chrome Mobile (Android)

**CSS Features Used:**
- CSS Variables (supported all modern browsers)
- Pseudo-elements (::before, ::after)
- CSS Gradients
- CSS Filters (grayscale)
- Transform animations (translateY)
- Box-shadow

### Performance Considerations

**Image Optimization:**
- Background image: 1.4MB (reasonable for hero image)
- JPEG format for photo compression
- Fixed positioning reduces repaint operations
- Single image reused across all views

**Font Loading:**
- Google Fonts CDN with display=swap
- Limited to 2 font families
- Minimal weight variations (400, 500, 600, 700)
- System font fallbacks prevent FOIT (Flash of Invisible Text)

**CSS Performance:**
- CSS variables reduce redundancy
- Consolidated selectors minimize file size
- Hardware-accelerated transforms (translateY)
- Efficient shadow rendering

### Future Considerations

**Potential Enhancements:**
- Consider WebP format for background (smaller file size)
- Implement lazy loading for background image
- Add preconnect hints for Google Fonts
- Consider variable fonts to reduce HTTP requests

**Maintenance Notes:**
- Background image is integral to design (avoid removing)
- CSS variables enable easy rebranding if needed
- Typography choices align with UVA Batten School brand
- Design system scalable to additional dashboard views

### Documentation References

**Related Documentation:**
- APPExplorer design system: (source project)
- UVA Branding Guidelines: Navy (#232D4B), Orange (#E57200)
- Azure Static Web Apps: https://docs.microsoft.com/azure/static-web-apps/
- Google Fonts: https://fonts.google.com/

---

## December 11, 2025 - Student Lounge 206 Resource Fix

### Issue
When clicking "Reserve Room" for Student Lounge 206, the Outlook booking form was pre-populating with the wrong resource name (`FBS-Commons-206`) instead of the correct one (`FBS-StudentLounge-206`).

### Fix
Updated the `roomEmailMap` in `index.html` (line 4315):

```javascript
// Before
"Student Lounge 206": "FBS-Commons-206@virginia.edu",

// After
"Student Lounge 206": "FBS-StudentLounge-206@virginia.edu",
```

### Commit
**Hash:** `992522a2`
**Message:** "Fix Student Lounge 206 reserve room resource name"

### Impact
Users can now click "Reserve Room" on Student Lounge 206 and have Outlook correctly pre-populate with the `FBS-StudentLounge-206` resource.

---
*Last updated: December 11, 2025*
*System Status: ✅ Fully Operational*
*Design Version: 2.0 (APPExplorer Integrated)*