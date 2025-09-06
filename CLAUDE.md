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

### Phase 3: Azure Cloud Deployment
**Goal**: Deploy to Azure Functions for production hosting

**Deployment Strategy**:

1. **Local Development** (Development and testing)
   ```bash
   # Quick start options
   python serve.py                    # Python server
   ./start_server.sh                  # Unix/Mac script  
   start_server.bat                   # Windows script
   ```

2. **Azure Functions** (Production deployment)
   - Dynamic calendar data processing
   - Scalable cloud hosting
   - Integration with Azure services
   - Cost-effective serverless architecture
   - Automatic scaling based on usage

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
├── dashboard.html              # Main dashboard (recommended UI)
├── room-dashboard.html         # Advanced dashboard with search
├── simple-dashboard.html       # File upload and processing
├── index.html                  # Basic grid view
├── config.js                   # Central configuration
├── ics-parser.js              # Calendar parsing engine
├── dashboard.js               # Dashboard functionality
├── styles.css                 # Base styling
├── serve.py                   # Local development server
├── start_server.{bat,sh}      # Platform-specific launchers
├── deploy-azure.sh            # Azure deployment script
├── web.config                 # IIS/Windows server config
├── ics/                       # Sample calendar files
│   ├── ConfA.ics
│   ├── GreatHall.ics
│   └── SeminarRoom.ics
├── azure-function/            # Azure Functions implementation
├── archive/                   # Historical versions
├── img/                       # Image assets
└── ChatGPT/                   # AI-assisted development logs
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

## Support & Maintenance

For ongoing maintenance:
1. **Monitor calendar data sources** for format changes
2. **Update Azure Functions configuration** as needed
3. **Review user feedback** and usage analytics
4. **Maintain documentation** as features are added
5. **Test across browsers** with each update

**Contact**: Issues and enhancements can be tracked through GitHub Issues on the BattenIT/RoomTool repository.