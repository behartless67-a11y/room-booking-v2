# Deploying to Netlify

This guide will help you deploy the UVA Room Booking Dashboard to Netlify.

## 📋 Prerequisites

1. A [Netlify account](https://netlify.com) (free tier works fine)
2. Your ICS calendar files or URLs to live calendar feeds
3. A GitHub repository (optional but recommended)

## 🚀 Quick Deploy

### Option 1: Drag & Drop Deploy

1. **Prepare your files:**
   - Download/clone this entire project folder
   - Update `config.js` with your ICS file locations (see Configuration section below)
   - Make sure your ICS files are in the `ics/` folder if using local files

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com) and log in
   - Click "Add new site" → "Deploy manually"
   - Drag the entire project folder to the deploy area
   - Your site will be live in seconds!

### Option 2: GitHub Deploy (Recommended)

1. **Create a GitHub repository:**
   - Create a new repository on GitHub
   - Upload all project files to the repository
   - Make sure to include your configured `config.js` and ICS files

2. **Connect to Netlify:**
   - In Netlify, click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select your repository
   - Build settings should be automatically detected (no build command needed)
   - Click "Deploy site"

3. **Auto-deploy:**
   - Any changes you push to GitHub will automatically redeploy your site
   - Perfect for keeping calendar data updated

## ⚙️ Configuration

Edit `config.js` to customize your deployment:

```javascript
window.DashboardConfig = {
    // ICS file locations - UPDATE THESE FOR YOUR DEPLOYMENT
    icsFiles: [
        // Option A: Local files (upload ICS files to your site)
        'ics/your-calendar.ics',
        'ics/another-calendar.ics',
        
        // Option B: Direct URLs to live calendar feeds
        'https://outlook.office365.com/owa/calendar/your-id/calendar.ics',
        'https://calendar.google.com/calendar/ical/your-id/public/basic.ics',
        
        // Option C: Mix of both
        'ics/local-file.ics',
        'https://external-calendar-url.com/calendar.ics'
    ],
    
    settings: {
        defaultView: 'day',
        dayViewStart: 8,  // 8 AM
        dayViewEnd: 20,   // 8 PM
        organizationName: 'Your Organization Name'
    }
};
```

## 📁 File Structure for Deployment

Your deployed site should include:

```
├── dashboard.html          # Main dashboard (this will be your homepage)
├── config.js              # Your configuration file
├── netlify.toml           # Netlify configuration
├── ics/                   # Your ICS calendar files (if using local files)
│   ├── calendar1.ics
│   ├── calendar2.ics
│   └── calendar3.ics
└── [other files...]       # Keep all other project files
```

## 🔧 ICS File Options

### Option 1: Upload ICS Files to Netlify

1. Place your `.ics` files in the `ics/` folder
2. Update `config.js` to reference them:
   ```javascript
   icsFiles: [
       'ics/conference-room-a.ics',
       'ics/great-hall.ics'
   ]
   ```
3. Deploy - the files will be served from your Netlify site

**Pros:** Simple, reliable, works offline
**Cons:** Manual updates needed when calendar changes

### Option 2: Direct URLs to Live Calendars

1. Get the direct ICS URLs from your calendar system
2. Update `config.js`:
   ```javascript
   icsFiles: [
       'https://outlook.office365.com/owa/calendar/your-id/calendar.ics',
       'https://calendar.google.com/calendar/ical/your-id/public/basic.ics'
   ]
   ```

**Pros:** Always up-to-date, automatic updates
**Cons:** Requires CORS support from calendar provider, may be slower

### Option 3: Hybrid Approach

Use Netlify Functions or a simple proxy to fetch live calendar data and cache it:

1. Set up a Netlify Function to fetch and cache calendar data
2. Point your `config.js` to the function endpoints
3. Configure automatic rebuilds to refresh data

## 🌐 Custom Domain

1. In your Netlify site dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Follow the DNS configuration instructions
4. Your dashboard will be available at your custom domain!

## 🔄 Automatic Updates

### For Local ICS Files:
- Set up a GitHub Action or script to periodically download fresh ICS files
- Commit changes to trigger automatic Netlify redeploy

### For Live Calendar URLs:
- The dashboard will fetch fresh data each time it loads
- Consider implementing client-side caching for better performance

## 🛠️ Troubleshooting

### CORS Issues with External Calendar URLs
- Some calendar providers block cross-origin requests
- Solution: Use Netlify Functions as a proxy, or upload ICS files directly

### ICS Files Not Loading
- Check that file paths in `config.js` match your actual file structure
- Verify ICS files are valid using an online validator
- Check browser console for specific error messages

### Site Not Updating
- If using GitHub deploy: Check that your changes are committed and pushed
- Clear browser cache or try incognito mode
- Check Netlify deploy logs for errors

## 📊 Performance Tips

1. **Optimize ICS files:** Remove unnecessary events or properties to reduce file size
2. **Use caching:** The `netlify.toml` file includes caching headers for ICS files
3. **Enable Netlify Analytics:** Track usage and performance
4. **Consider a CDN:** For heavy usage, consider serving ICS files from a CDN

## 🔒 Security

- The dashboard only reads calendar data, never writes
- ICS files may contain sensitive information - ensure appropriate access controls
- Consider using environment variables for sensitive configuration

## 📈 Monitoring

- Use Netlify Analytics to track usage
- Monitor site performance with Netlify's built-in tools
- Set up status page monitoring for critical deployments

## 🆘 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your `config.js` configuration
3. Test ICS file URLs directly in your browser
4. Check Netlify deploy logs for build errors

## 💡 Pro Tips

- Use descriptive commit messages for easier debugging
- Keep a backup of your configuration and ICS files
- Test changes locally before deploying
- Use Netlify's branch previews to test changes safely
- Consider setting up monitoring/alerts for your live site

