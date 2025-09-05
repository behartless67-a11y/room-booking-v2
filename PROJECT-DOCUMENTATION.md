# RoomTool Project Documentation

## Overview

The RoomTool is a real-time room booking dashboard for the UVA Frank Batten School of Leadership and Public Policy. It displays live calendar information from Microsoft Outlook calendars, showing room availability and current bookings across multiple buildings.

**Live Demo:** http://localhost/RoomBooking/index.html (local development)  
**Repository:** https://github.com/BattenIT/RoomTool  
**Deployed:** Ready for AWS EC2 deployment

---

## Architecture

### Frontend
- **Single-page HTML application** with embedded JavaScript
- **No external frameworks** - vanilla HTML/CSS/JS for simplicity
- **Responsive design** with UVA branding
- **Real-time calendar integration**

### Backend
- **PHP calendar proxy** (`calendar-proxy.php`) for CORS handling
- **Apache web server** with PHP support
- **Direct integration** with Microsoft Outlook Web Access (OWA)

### Calendar Integration
- **Live Outlook calendars** via ICS feeds
- **Recurring event processing** (RRULE support)
- **Eastern Time timezone handling**
- **Real-time updates** with configurable refresh intervals

---

## Project History & Problems Solved

### Phase 1: Initial Setup ✅
**Goal:** Basic room booking dashboard  
**Challenge:** Static calendar files weren't updating  
**Solution:** Implemented live Outlook URL integration

### Phase 2: Pavilion X Integration ✅
**Goal:** Add Pavilion X room calendars  
**Problem:** Only had local .ics files, not live data  
**Solution:** 
- Obtained live Outlook URLs for all 4 Pavilion X rooms
- Updated config.js with live URLs
- Implemented calendar-proxy.php for CORS handling

### Phase 3: Recurring Events Crisis 🚨 → ✅
**Problem:** Events showing for yesterday but not today  
**Root Cause:** HTML parser completely ignored RRULE properties  
**Investigation:** Added debug logging with "Ben" prefix for easier identification  
**Solution:** 
- Added RRULE parsing to parseEventProperty() method
- Implemented expandRecurringEvent() method for weekly/daily events
- Added proper timezone conversion for Eastern Time
- Result: Peter Greubel's Thursday meetings and other recurring events now work

### Phase 4: UI Polish ✅
**Problem:** Karsh logo showing as white box  
**Root Cause:** CSS rule applied white filter to both logos  
**Solution:** 
- Separated CSS rules for .batten-logo and .karsh-logo
- Updated to use horizontal Karsh logo version
- Proper logo display without unwanted filters

### Phase 5: AWS Deployment Preparation ✅
**Goal:** Production deployment capability  
**Challenge:** Original S3 deployment won't work (no PHP support)  
**Solution:** 
- Created complete EC2 deployment infrastructure
- Automated LAMP stack setup (setup-ec2.sh)
- GitHub-based deployment automation (deploy-ec2.sh)
- Comprehensive deployment documentation

---

## File Structure

```
RoomTool/
├── index.html                      # Main application (HTML + embedded JS/CSS)
├── config.js                       # Room and calendar configuration
├── calendar-proxy.php              # PHP proxy for calendar fetching
├── ics-parser.js                   # Separate ICS parser (not used - code in HTML)
├── dashboard.js                    # Separate dashboard code (not used - code in HTML)
├── 
├── # Deployment & Documentation
├── setup-ec2.sh                    # EC2 LAMP stack setup
├── deploy-ec2.sh                   # Automated deployment script
├── README-EC2-DEPLOYMENT.md        # Deployment instructions
├── PROJECT-DOCUMENTATION.md        # This file
├── 
├── # Assets
├── img/
│   ├── uva-karsh-logo-horizontal.png  # Karsh Institute logo
│   ├── karsh.png                      # Alternative Karsh logo
│   └── KarshLogo.png                  # Another alternative
├── bat_rgb_ko.png                     # UVA Batten School logo
├── 
├── # Legacy/Development files
├── ics/                               # Local ICS files (mostly replaced by live URLs)
├── test.html                          # Development testing file
├── deploy-aws.sh                      # S3 deployment (won't work with PHP)
└── ...
```

---

## Configuration Guide

### Adding New Rooms

Edit `config.js` and add to the appropriate building:

```javascript
{
    name: "New Room Name",
    id: "unique-room-id", 
    icsFile: "https://outlook.office365.com/owa/calendar/[calendar-id]/calendar.ics"
}
```

**Don't forget to also update the legacy `icsFiles` array!**

### Getting Outlook Calendar URLs

1. **Go to Outlook Web Access** (outlook.office365.com)
2. **Navigate to the room calendar**
3. **Right-click calendar → "Share" → "Get Link"**
4. **Copy the ICS URL** (ends with `/calendar.ics`)

### Room Location Mapping

The system automatically extracts room names from the `LOCATION` field in calendar events. Current mappings:

- `FBS-ConfA-L014` → Conference Room A L014
- `FBS-GreatHall-100` → Great Hall 100
- `FBS-SeminarRoom-L039` → Seminar Room L039
- `FBS-PavX-BasementRoom1` → Pavilion X Basement Room 1
- etc.

To add new location mappings, edit the `extractRoom()` method in `index.html`.

---

## Troubleshooting Guide

### Common Issues

#### 1. Events Not Showing
**Symptoms:** Calendar loads but no events display  
**Causes & Solutions:**
- **Wrong date selected:** Check date picker is set correctly
- **Room filter:** Try "All Rooms" to see if events appear
- **Cache issue:** Hard refresh (Ctrl+F5)
- **Calendar URL:** Test URL directly: `http://localhost/RoomBooking/calendar-proxy.php?url=[calendar-url]`

#### 2. Recurring Events Missing
**Symptoms:** One-time events show, but recurring meetings don't  
**Debug:** Look for "Ben" messages in browser console
- **Ben 🆔 Found RRULE:** RRULE properties are being parsed
- **Ben 🔁 Found recurring event:** Recurring events detected
- **Ben ✅ Generated instance:** Individual instances created
- **Ben 🎯 TODAY!:** Today's events generated

**If missing these messages:** RRULE processing is broken

#### 3. Calendar Proxy Errors
**Symptoms:** 500 errors in Network tab  
**Check:**
- Apache error logs: `/var/log/httpd/error_log`
- PHP error reporting in calendar-proxy.php
- CORS headers properly set
- Calendar URL accessibility

#### 4. Logo/Image Issues
**Symptoms:** Broken images, white boxes  
**Check:**
- File exists in correct path
- CSS filters not incorrectly applied
- Browser cache (hard refresh)

### Debug Mode

Add debug logging by searching for "Ben" messages in browser console:
- Shows calendar fetching progress
- RRULE processing details
- Event generation and filtering
- Room assignment logic

---

## Development Workflow

### Local Development Setup

1. **Install XAMPP** or similar (Apache + PHP)
2. **Clone repository** to web directory
3. **Start Apache** service
4. **Access:** `http://localhost/RoomBooking/`

### Making Changes

#### Frontend Changes
- **UI/Layout:** Edit `index.html` (CSS is embedded)
- **Room Configuration:** Edit `config.js`
- **Calendar Logic:** Edit JavaScript in `index.html` (not separate files)

#### Backend Changes
- **Calendar Fetching:** Edit `calendar-proxy.php`
- **CORS/Security:** Modify headers in calendar-proxy.php

#### Testing Changes
1. **Hard refresh browser** (Ctrl+F5) to clear cache
2. **Check browser console** for errors/debug messages
3. **Test different rooms/dates** to verify functionality
4. **Monitor Network tab** for failed requests

### Deployment Workflow

#### Development → Staging
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

#### Staging → Production
```bash
./deploy-ec2.sh
```
(Automatically pulls from GitHub and deploys)

---

## Technical Deep Dive

### Calendar Processing Flow

1. **Configuration Loading**
   - `config.js` defines buildings and room calendar URLs
   - System loads both live URLs and legacy local files

2. **Calendar Fetching**
   - JavaScript calls `calendar-proxy.php` for each calendar
   - Proxy fetches ICS data from Outlook with proper headers
   - CORS headers added for browser compatibility

3. **ICS Parsing**
   - Parse VEVENT blocks from ICS data
   - Extract: SUMMARY, DTSTART, DTEND, LOCATION, RRULE
   - Handle timezone conversion (Eastern Time → Browser time)

4. **Recurring Event Processing**
   - Detect RRULE properties (FREQ=WEEKLY, BYDAY=TH, etc.)
   - Generate individual instances for next 6 months
   - Apply duration and timezone to each instance

5. **Room Assignment**
   - Extract room from LOCATION field using regex patterns
   - Map calendar locations to display room names
   - Filter events by selected room

6. **Display Rendering**
   - Sort events by start time
   - Render time slots with event blocks
   - Apply color coding based on availability

### RRULE Processing Details

**Supported RRULE formats:**
```
FREQ=WEEKLY;UNTIL=20241212T203000Z;INTERVAL=1;BYDAY=TH;WKST=SU
```

**Day mapping:**
- SU=0, MO=1, TU=2, WE=3, TH=4, FR=5, SA=6

**Generation algorithm:**
1. Parse RRULE parameters
2. Find first occurrence on target day
3. Generate weekly instances until UNTIL date
4. Apply original event duration to each instance
5. Mark instances with `_isRecurringInstance: true`

### Security Considerations

**Implemented:**
- CORS headers for calendar proxy
- Input validation on calendar URLs
- XSS protection headers
- Cache control for sensitive data

**Production recommendations:**
- SSL/HTTPS certificates
- Rate limiting on calendar proxy
- Access logs monitoring
- Regular security updates

---

## Maintenance Guide

### Regular Tasks

#### Weekly
- **Monitor calendar accuracy:** Verify events showing correctly
- **Check error logs:** Look for 500 errors or failed calendar fetches
- **Test recurring events:** Ensure weekly meetings are generating

#### Monthly
- **Update system packages:** `sudo yum update` (on EC2)
- **Review access logs:** Check for unusual traffic patterns
- **Verify SSL certificates:** Renew if needed with Let's Encrypt

#### As Needed
- **Add new rooms:** Get Outlook URLs and update config.js
- **Update logos/branding:** Replace image files and update HTML
- **Calendar URL changes:** Update config.js if Microsoft changes URLs

### Performance Optimization

**Current optimizations:**
- 5-minute auto-refresh interval
- Calendar proxy caching headers
- Static asset caching (CSS/JS/images)
- Compressed responses

**Potential improvements:**
- CDN for static assets
- Database caching for calendar data
- Client-side event caching
- Reduced polling frequency

### Monitoring

**Key metrics to watch:**
- Calendar proxy response times
- 500 error frequency
- Event accuracy vs Outlook
- User engagement (page views, time on site)

**Log locations (EC2):**
- Apache access: `/var/log/httpd/access_log`
- Apache errors: `/var/log/httpd/error_log`
- PHP errors: Check `error_log` configuration

---

## Future Enhancements

### Potential Features
- **Email notifications** for upcoming meetings
- **Room booking interface** (beyond just viewing)
- **Mobile app** or PWA version
- **Integration with other calendar systems** (Google Calendar)
- **Analytics dashboard** for room utilization
- **Multi-language support**

### Technical Improvements
- **Database backend** for better performance
- **REST API** for mobile/external integrations
- **Real-time updates** via WebSockets
- **Advanced filtering** (by organizer, event type, etc.)
- **Export functionality** (PDF reports, CSV data)

### Administrative Features
- **Web-based configuration** (no more editing config.js)
- **User management** and access control
- **Audit logging** for changes
- **Backup and restore** functionality

---

## Contact & Support

**Repository:** https://github.com/BattenIT/RoomTool  
**Primary Developer:** Ben Hartless (bh4hb@virginia.edu)  
**Organization:** UVA Frank Batten School of Leadership and Public Policy  

**For issues:**
1. Check this documentation first
2. Look at browser console for error messages
3. Check server logs if deployed to EC2
4. Create GitHub issue with detailed description

**For new features:**
1. Create GitHub issue describing the need
2. Include mockups/examples if UI changes
3. Consider backward compatibility impact

---

*Last updated: September 5, 2025*  
*This documentation should be updated whenever significant changes are made to the system.*