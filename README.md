# BattenSpace

A live dashboard for viewing room availability and schedules at the UVA Batten School.

## 🚀 Quick Start

### For Local Development

**Windows Users:**
1. Double-click `start_server.bat`
2. Your browser should automatically open to the dashboard
3. If not, visit: http://localhost:8000/dashboard.html

**Mac/Linux Users:**
1. Open Terminal and navigate to this folder
2. Run: `./start_server.sh`
3. Your browser should automatically open to the dashboard
4. If not, visit: http://localhost:8000/dashboard.html

**Manual Python Server:**
```bash
# In this directory, run:
python serve.py
# or
python3 serve.py

# Then visit: http://localhost:8000/dashboard.html
```

### For Production (Netlify)

1. **Configure your calendar sources** in `config.js`
2. **Deploy to Netlify** - see [DEPLOY.md](DEPLOY.md) for detailed instructions
3. **Access your live dashboard** at your Netlify URL

## ⚙️ Configuration

Edit `config.js` to specify your ICS calendar file locations:

```javascript
window.DashboardConfig = {
    icsFiles: [
        // Local files (for development)
        'ics/ConfA.ics',
        'ics/GreatHall.ics',
        
        // Or live calendar URLs (for production)
        'https://outlook.office365.com/owa/calendar/your-id/calendar.ics'
    ],
    
    settings: {
        defaultView: 'day',
        dayViewStart: 8,  // 8 AM
        dayViewEnd: 20,   // 8 PM
        organizationName: 'Your Organization'
    }
};
```

## 🏢 Supported Room Formats

The system automatically recognizes these room formats from calendar locations:
- `FBS-ConfA-L014` → Conference Room A L014
- `FBS-GreatHall-100` → Great Hall 100  
- `FBS-SeminarRoom-L039` → Seminar Room L039
- `Conference Room A` → Conference Room A
- `Great Hall 100` → Great Hall 100

## 📱 Available Views

### 🏠 Main Dashboard (`dashboard.html`) - **Recommended**
- **Single consolidated file** - perfect for Netlify deployment
- **Modern card-based interface** with beautiful UVA styling
- **Day/Week/Month views** with smooth transitions  
- **Interactive time slots** - click to see event details
- **Configurable via config.js** - easy to customize
- **Responsive design** - works on all devices

### 🏛️ Advanced Dashboard (`room-dashboard.html`)
- **Full-featured version** with room search functionality
- **Find available rooms** by time and duration
- **Multiple calendar file support**
- **Built-in file upload and processing**

### 📝 Simple Dashboard (`simple-dashboard.html`)
- **File upload interface** for processing .ics files
- **Event list view** by date and room
- **Debug information** for troubleshooting

### 🔧 Basic View (`index.html`)
- **Grid-based time view** with traditional layout
- **Multiple view modes** (Grid/List/Debug)

## ⚡ Features

- **🔄 Real-time Updates**: Live room availability status
- **🎯 Smart Room Search**: Find available rooms by time and duration  
- **📅 Multiple Calendar Support**: Load multiple .ics files at once
- **🎨 Modern UI**: Beautiful, responsive design with UVA branding
- **🔍 Event Details**: Click any event to see full information
- **📱 Mobile Friendly**: Works perfectly on phones and tablets
- **⚙️ Debug Mode**: Troubleshoot parsing issues

## 🛠️ Troubleshooting

### "No calendar data available"
- Make sure you've uploaded .ics files using the simple dashboard first
- Check that the files are valid .ics calendar files
- Try refreshing the page

### "CORS errors" in browser console
- Use the local server (run `start_server.bat` or `start_server.sh`)
- Don't open HTML files directly in browser - they need to be served

### Room names not showing correctly
- Check the Debug view in the simple dashboard
- Verify your .ics files contain location information in FBS format
- Look at the console for parsing details

### Events not showing for today
- Verify the date picker is set to today's date
- Check timezone settings in your calendar export
- Use the Debug view to see parsed event dates

## 🔧 Technical Details

- **Frontend**: Vanilla JavaScript, CSS Grid, Modern Web APIs
- **Backend**: Python HTTP server for local development
- **Data Format**: Standard ICS/iCal calendar files
- **Parsing**: Custom ICS parser with UVA-specific room extraction
- **Storage**: Browser localStorage for persistence
- **Styling**: Custom CSS with UVA branding colors

## 📁 File Structure

```
├── dashboard.html         # 🌟 Main dashboard (recommended)
├── config.js             # Configuration file
├── netlify.toml          # Netlify deployment config
├── DEPLOY.md             # Netlify deployment guide
├── room-dashboard.html   # Advanced dashboard with search
├── simple-dashboard.html # File upload and processing
├── index.html           # Basic grid view
├── ics-parser.js        # Calendar parsing logic
├── dashboard.js         # Grid dashboard functionality
├── styles.css           # Basic styling
├── serve.py            # Local development server
├── start_server.bat    # Windows server launcher
├── start_server.sh     # Unix/Mac server launcher
├── ics/                # Sample calendar files
│   ├── ConfA.ics
│   ├── GreatHall.ics
│   └── SeminarRoom.ics
└── README.md           # This file
```

## 🎨 Customization

The dashboard uses UVA brand colors:
- **Navy**: #232d4b (primary text, headers)
- **Orange**: #e57200 (accents, buttons)
- **Light backgrounds**: Various shades for cards and sections

To customize colors, edit the CSS custom properties in `room-dashboard.html`.

## 🆘 Support

If you encounter issues:
1. Check the browser console for error messages
2. Try the Debug view in the simple dashboard
3. Verify your .ics files are valid
4. Make sure you're using the local server

## 📜 License

**BattenSpace** - Built for UVA Batten School. Customize as needed for your institution.