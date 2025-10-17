# CLAUDE.md - BattenSpace Development Guide

## Project Overview

**BattenSpace** is a real-time room availability dashboard for the UVA Batten School, designed to display live room scheduling and availability information from ICS calendar files. This web-based tool provides multiple dashboard interfaces for viewing room schedules, finding available rooms, and managing calendar data.

### Core Purpose
- Display real-time room availability across multiple rooms
- Parse and process ICS calendar files from various sources
- Provide intuitive interfaces for different user needs (simple viewing, advanced search, administrative management)
- Support local development and Azure cloud deployment

### Technology Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Python HTTP server for local development
- **Data Processing**: Custom ICS parser with UVA-specific room format recognition  
- **Deployment**: Azure Functions for production hosting
- **Styling**: Custom CSS with UVA branding (Navy #232d4b, Orange #e57200)

## Documentation Structure

This repository contains comprehensive documentation across multiple files:

### Primary Documentation
- **[README.md](README.md)** - Main user guide with quick start instructions and feature overview
- **[PROJECT-DOCUMENTATION.md](PROJECT-DOCUMENTATION.md)** - Detailed technical documentation and project history

### Deployment Guides
- **[AZURE-DEPLOYMENT-GUIDE-FOR-MANAGER.md](AZURE-DEPLOYMENT-GUIDE-FOR-MANAGER.md)** - Azure deployment for managers
- **[azure-function/README.md](azure-function/README.md)** - Azure Functions specific documentation

### Update Logs
- **[DEPLOYMENT-UPDATES.md](DEPLOYMENT-UPDATES.md)** - Changelog for deployment configurations
- **[AZURE-FUNCTION-UPDATES.md](AZURE-FUNCTION-UPDATES.md)** - Azure Functions update history

## Development Workflow

### Phase 1: Initial Tool Creation
**Goal**: Create a functional room availability dashboard

**Steps I would have recommended**:
1. **Requirements Analysis**
   - Identify calendar data sources (ICS files)
   - Define room naming conventions (FBS format: `FBS-RoomName-Number`)
   - Determine UI requirements (day/week/month views)
   - Plan for Azure deployment architecture

2. **Core Development**
   ```bash
   # Create project structure
   mkdir BattenSpace
   cd BattenSpace
   
   # Core files to create first
   touch index.html              # Basic dashboard
   touch ics-parser.js          # Calendar parsing logic
   touch styles.css             # Base styling
   touch config.js              # Configuration management
   touch serve.py               # Local development server
   ```

3. **ICS Parser Development** 
   - Build robust parsing for standard ICS format
   - Implement UVA-specific room name extraction
   - Handle timezone conversions and date parsing
   - Add error handling for malformed calendar data

4. **Dashboard Interfaces**
   - **Simple Dashboard**: File upload and basic event listing
   - **Main Dashboard**: Card-based interface with modern UI
   - **Advanced Dashboard**: Room search and filtering capabilities
   - **Basic View**: Grid-based traditional calendar layout

5. **Configuration System**
   - Centralized config in `config.js`
   - Support for both local files and remote URLs
   - Flexible settings for organization customization

### Phase 2: GitHub Repository Setup
**Goal**: Establish proper version control and collaboration

**Repository Structure Setup**:
```bash
# Initialize repository
git init
git remote add origin https://github.com/BattenIT/RoomTool.git

# Essential files to include
echo "node_modules/" > .gitignore
echo "*.log" >> .gitignore
echo ".env" >> .gitignore

# Create proper README structure
# Add deployment guides
# Include sample data and configuration
```

**Best Practices Implemented**:
- Comprehensive README with quick start guide
- Azure-focused deployment documentation
- Sample ICS files for testing (`ics/` directory)
- Cross-platform server scripts (`start_server.bat`, `start_server.sh`)
- Proper .gitignore to exclude unnecessary files

### Phase 3: Azure Cloud Deployment (CURRENT PRODUCTION)
**Goal**: Deploy to Azure Functions for production hosting

**Deployment Strategy**:

1. **Local Development** (Development and testing)
   ```bash
   # Quick start options
   python serve.py                    # Python server
   ./start_server.sh                  # Unix/Mac script
   start_server.bat                   # Windows script
   ```

2. **Azure Static Web Apps** (Production deployment - CURRENT)
   - **Live URL**: https://nice-dune-0d695b810.2.azurestaticapps.net/
   - **Custom Domains**: appexplorer.thebattenspace.org, www.thebattenspace.org
   - **Auto-deployment**: GitHub Actions workflow triggers on push to main
   - **Deployment time**: 2-3 minutes
   - **Zero downtime**: Seamless updates
   - **Authentication**: Azure Entra ID (Azure AD) with UVA credentials

3. **Azure Functions** (Backend services)
   - Calendar data caching (15-minute refresh cycle)
   - API endpoints for calendar data
   - User role mapping (`GetUserRoles` function)
   - Manual deployment required: `func azure functionapp publish roomtool-calendar-function --python`

### Phase 4: Authentication & Access Control (CURRENT)
**Goal**: Secure the application with Azure Entra ID authentication

**Authentication Implementation**:

1. **Azure Entra ID Integration**
   - **Provider**: Azure Active Directory (Entra ID)
   - **Tenant**: UVA (myuva.onmicrosoft.com)
   - **Login Flow**: Automatic redirect to UVA login for unauthenticated users
   - **Groups**: `FBS_StaffAll`, `FBS_Community`
   - **Access Level**: Both groups have full read-only access to dashboard

2. **Authentication Configuration**
   - **Client ID**: `0b45a06e-6b4a-4c3e-80ff-01d0c11a9def`
   - **Tenant ID**: `7b3480c7-3707-4873-8b77-e216733a65ac`
   - **Client Secret**: Stored in Azure Key Vault (eieide2kv)
   - **Setup Guide**: See [ENTRA-ID-SETUP-GUIDE.md](ENTRA-ID-SETUP-GUIDE.md)

3. **User Experience**
   - User visits site → Redirects to UVA login (if not authenticated)
   - After login → Dashboard displays with "Welcome, [Name]" and Logout button
   - Group membership checked automatically
   - All dashboard features available to both groups

4. **Technical Components**
   - `staticwebapp.config.json`: Authentication routes and provider configuration
   - `GetUserRoles` Azure Function: Maps Azure AD groups to application roles
   - `dashboard.js`: User info display and role checking helper methods
   - `styles.css`: User info UI styling

### ⚠️ CRITICAL: Deployment Workflow

**ALL CODE CHANGES AUTO-DEPLOY TO PRODUCTION VIA GIT PUSH:**

```bash
# Standard workflow for any code change
git add .
git commit -m "Description of changes"
git push origin main

# Within 2-3 minutes:
# → GitHub Actions triggers
# → Azure Static Web Apps deploys
# → Live site updates automatically
```

**Key Points**:
- Every push to `main` branch deploys to production immediately
- No manual deployment steps needed for frontend changes
- Monitor deployment: GitHub Actions tab or Azure Portal
- Azure Functions require separate manual deployment

### Development Commands & Scripts

**Local Development**:
```bash
# Start local server
python serve.py                      # Basic Python server
python3 serve.py                     # Python 3 specific
./start_server.sh                    # Unix/Mac convenience script
start_server.bat                     # Windows convenience script

# Access dashboards
open http://localhost:8000/dashboard.html        # Main dashboard
open http://localhost:8000/room-dashboard.html   # Advanced dashboard  
open http://localhost:8000/simple-dashboard.html # File upload interface
```

**Testing & Validation**:
```bash
# Validate ICS files
python -c "import ics-parser; validate_ics_file('ics/ConfA.ics')"

# Test different browsers
open -a "Google Chrome" http://localhost:8000/dashboard.html
open -a Safari http://localhost:8000/dashboard.html
```

**Azure Deployment**:
```bash
# Azure deployment  
./deploy-azure.sh
```

## File Structure & Purpose

```
BattenSpace/
├── dashboard.html                  # Main dashboard (recommended UI)
├── room-dashboard.html             # Advanced dashboard with search
├── simple-dashboard.html           # File upload and processing
├── index.html                      # Basic grid view
├── config.js                       # Central configuration
├── ics-parser.js                  # Calendar parsing engine
├── dashboard.js                   # Dashboard functionality (with auth)
├── styles.css                     # Base styling (with auth UI)
├── staticwebapp.config.json       # Azure Static Web Apps auth config
├── serve.py                       # Local development server
├── start_server.{bat,sh}          # Platform-specific launchers
├── deploy-azure.sh                # Azure deployment script
├── web.config                     # IIS/Windows server config
├── ENTRA-ID-SETUP-GUIDE.md       # Authentication setup instructions
├── ics/                           # Sample calendar files
│   ├── ConfA.ics
│   ├── GreatHall.ics
│   └── SeminarRoom.ics
├── azure-function/                # Azure Functions implementation
│   ├── GetCalendar/              # Calendar API endpoint
│   ├── CalendarRefresh/          # Scheduled calendar refresh
│   ├── GetUserRoles/             # User role mapping for auth
│   ├── ManualRefresh/            # Manual trigger for refresh
│   ├── TestFunction/             # Test endpoint
│   └── DebugStatus/              # Debug information
├── archive/                       # Historical versions
├── img/                           # Image assets
└── ChatGPT/                       # AI-assisted development logs
```

## Future Development Guidelines

### Adding New Features
1. **Test locally first** using `serve.py` 
2. **Update configuration** in `config.js` if needed
3. **Maintain backward compatibility** with existing dashboards
4. **Update relevant documentation** files
5. **Test Azure deployment** after local validation

### Code Standards
- Use vanilla JavaScript for maximum compatibility
- Follow UVA branding guidelines for UI elements
- Maintain responsive design principles
- Include error handling and user feedback
- Comment complex parsing logic

### Calendar Integration
- Support standard ICS format specifications
- Handle various timezone formats gracefully  
- Parse location data for room identification
- Provide fallback options for missing data

### Performance Considerations
- Minimize external dependencies
- Optimize for mobile devices
- Cache calendar data appropriately
- Handle large calendar files efficiently
- Leverage Azure Functions scaling capabilities

## Troubleshooting Common Issues

### Calendar Data Issues
- Verify ICS file validity using debug mode
- Check timezone settings in source calendars
- Validate room naming conventions (FBS format)
- Review parser logs for malformed entries

### Deployment Issues  
- Ensure CORS settings for remote calendar URLs
- Verify Azure Functions configuration
- Check SSL certificate validity for HTTPS sources
- Monitor Azure logs for parsing errors

### UI/UX Issues
- Test across different browser versions
- Validate responsive design on mobile devices
- Ensure accessibility compliance
- Verify color contrast meets standards

## Authentication Maintenance

### Regular Tasks
1. **Client Secret Rotation** (Every 6 months)
   - You'll receive automated email notification from Azure
   - Retrieve new secret from Key Vault
   - Update `AAD_CLIENT_SECRET` in Static Web App configuration
   - Test authentication flow after update

2. **Group Membership Management**
   - Groups managed by UVA IT in Azure AD
   - Users added/removed via Azure AD Groups: `FBS_StaffAll`, `FBS_Community`
   - No code changes needed when membership changes

3. **Monitoring Authentication**
   - Check Azure Portal → Static Web Apps → Logs for authentication errors
   - Monitor `GetUserRoles` function logs for role mapping issues
   - Test login flow periodically with different user accounts

### Optional: Managed Identity Setup
For enhanced security, contact Judy to enable Managed Identity:
- Eliminates manual secret management
- Azure handles authentication automatically
- More secure than storing secrets in app settings

## Support & Maintenance

For ongoing maintenance:
1. **Monitor calendar data sources** for format changes
2. **Update Azure Functions configuration** as needed
3. **Monitor authentication logs** and client secret expiration
4. **Review user feedback** and usage analytics
5. **Maintain documentation** as features are added
6. **Test across browsers** with each update

**Contact**:
- **Authentication Issues**: Judy or UVA IT Azure team
- **Application Issues**: GitHub Issues on BattenIT/RoomTool repository
- **Developer**: Ben Hartless (bh4hb@virginia.edu)