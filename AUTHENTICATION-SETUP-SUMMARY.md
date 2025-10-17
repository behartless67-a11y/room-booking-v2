# Authentication Setup Summary - October 17, 2025

## What We Did Today

Successfully implemented Azure Entra ID (Azure AD) authentication for the BattenSpace room booking application.

---

## ✅ Completed Steps

### 1. Code Implementation
- **Created** `staticwebapp.config.json` with Azure AD authentication configuration
- **Created** `GetUserRoles` Azure Function to map AD groups to app roles
- **Updated** `dashboard.js` with user info display and authentication helpers
- **Updated** `styles.css` with user info UI styling
- **Created** comprehensive documentation in `ENTRA-ID-SETUP-GUIDE.md`

### 2. Deployed Code
- **Committed and pushed** all authentication code to GitHub
- **Auto-deployed** to Azure Static Web Apps via GitHub Actions (completed successfully)
- **Deployed** GetUserRoles Azure Function to `roomtool-calendar-function`

### 3. Azure Portal Configuration
- **Added** application settings to Static Web App `room-booking`:
  - `AAD_CLIENT_ID`: `0b45a06e-6b4a-4c3e-80ff-01d0c11a9def`
  - `AAD_CLIENT_SECRET`: `[Retrieved from Azure Key Vault]`

---

## 🏗️ BattenSpace Architecture

### Planned Domain Structure
```
thebattenspace.org (or www.thebattenspace.org)
  └── Main landing page with all Batten School tools
      ├── roomres.thebattenspace.org    → Room Booking Tool (this app)
      ├── appexplorer.thebattenspace.org → App Explorer Tool
      └── [other tools...]                → Future tools
```

### Authentication Strategy
Each tool subdomain is a separate Azure Static Web App that requires authentication:
- Users visit `thebattenspace.org` (landing page - may be public or protected)
- Click on a tool (e.g., "Room Booking")
- Redirect to `roomres.thebattenspace.org`
- If not authenticated, redirect to UVA login
- After login, return to the tool

## ⚠️ Outstanding Issue: Redirect URI Mismatch

### Problem
When testing authentication at `https://roomres.thebattenspace.org`, we get this error:

```
AADSTS50011: The redirect URI 'https://roomres.thebattenspace.org/.auth/login/aad/callback'
specified in the request does not match the redirect URIs configured for the application
'0b45a06e-6b4a-4c3e-80ff-01d0c11a9def'.
```

### Root Cause
The App Registration is missing the redirect URI for `roomres.thebattenspace.org`.

### Currently Configured Redirect URIs (from Judy's email)
- ✅ `https://appexplorer.thebattenspace.org/.auth/login/aad/callback`
- ✅ `https://calm-rock-0599eab0f.1.azurestaticapps.net/.auth/login/aad/callback`
- ✅ `https://www.thebattenspace.org/.auth/login/aad/callback`

### Missing Redirect URI for Room Booking App
- ❌ `https://roomres.thebattenspace.org/.auth/login/aad/callback` - **NEEDS TO BE ADDED**

### Note on Future Tools
As you add more tools under `thebattenspace.org`, each will need its own redirect URI added to the App Registration:
- Pattern: `https://[subdomain].thebattenspace.org/.auth/login/aad/callback`

---

## 🔧 Next Steps - Action Required

### Contact Judy to Add Missing Redirect URI

**Email Template:**

```
Subject: Add Redirect URI for Room Booking Authentication

Hi Judy,

Thanks for setting up the authentication for the room booking app! I'm testing it now
and getting a redirect URI mismatch error.

The app is trying to use: https://roomres.thebattenspace.org/.auth/login/aad/callback

But this redirect URI wasn't in the list you configured. Could you please add this to
the App Registration (Client ID: 0b45a06e-6b4a-4c3e-80ff-01d0c11a9def)?

Redirect URI to add:
• https://roomres.thebattenspace.org/.auth/login/aad/callback

Once that's added, the authentication should work!

Thanks,
Ben
```

### After Judy Adds the Redirect URI

1. **Wait 5 minutes** for the change to propagate
2. **Test in incognito browser**: https://roomres.thebattenspace.org
3. **Expected behavior**:
   - Redirects to UVA/Microsoft login
   - Enter UVA credentials
   - Redirects back to dashboard
   - Shows "Welcome, [Your Name]" with Logout button

---

## 📋 Authentication Configuration Details

### App Registration Information
- **Client ID**: `0b45a06e-6b4a-4c3e-80ff-01d0c11a9def`
- **Tenant ID**: `7b3480c7-3707-4873-8b77-e216733a65ac`
- **Client Secret**: Stored in Azure Key Vault `eieide2kv`
  - Access via: https://portal.azure.com (use eservices account, not SA)
  - **Important**: Rotates every 6 months (you'll get automated email)

### Azure AD Groups
- **FBS_StaffAll**: Batten School staff members
- **FBS_Community**: Batten School community members
- **Access Level**: Both groups have full read-only access to dashboard

### Azure Resources
- **Static Web App**: `room-booking` (nice-dune-0d695b810)
- **Azure Functions**: `roomtool-calendar-function`
- **Resource Group**: `Webtools`

---

## 📂 Files Modified/Created

### New Files
```
/staticwebapp.config.json                    # Azure SWA auth config
/azure-function/GetUserRoles/__init__.py     # Role mapping function
/azure-function/GetUserRoles/function.json   # Function configuration
/ENTRA-ID-SETUP-GUIDE.md                     # Detailed setup guide
/AUTHENTICATION-SETUP-SUMMARY.md             # This file
```

### Modified Files
```
/dashboard.js        # Added user info display and auth helpers
/styles.css          # Added user info UI styling
/CLAUDE.md          # Added Phase 4: Authentication section
```

---

## 🧪 Testing Checklist

Once Judy adds the redirect URI, test the following:

### Login Flow
- [ ] Visit https://roomres.thebattenspace.org in incognito browser
- [ ] Redirects to UVA login page
- [ ] Enter UVA credentials
- [ ] Redirects back to dashboard successfully
- [ ] "Welcome, [Your Name]" displays at top
- [ ] Logout button appears

### User Roles (Browser Console)
- [ ] Open browser console (F12)
- [ ] Check logs show: `Authenticated user: [username]`
- [ ] Check logs show: `User roles: ["staff", "authenticated"]` or `["community", "authenticated"]`

### Dashboard Functionality
- [ ] Dashboard loads calendar data correctly
- [ ] All room cards display
- [ ] Events show properly
- [ ] No JavaScript errors in console

### Logout
- [ ] Click "Logout" button
- [ ] User is logged out
- [ ] Visiting site again requires re-authentication

---

## 🔐 Security Notes

1. **Client Secret**:
   - Never commit to git
   - Stored in Azure Key Vault only
   - Also configured in Static Web App environment variables

2. **Secret Rotation**:
   - Happens every 6 months automatically
   - You'll receive email notification
   - Update `AAD_CLIENT_SECRET` in Static Web App environment variables

3. **Group Membership**:
   - Managed by UVA IT in Azure AD
   - No code changes needed when users added/removed

---

## 📚 Documentation References

1. **[ENTRA-ID-SETUP-GUIDE.md](ENTRA-ID-SETUP-GUIDE.md)** - Complete setup instructions
2. **[CLAUDE.md](CLAUDE.md)** - Project development guide with authentication section
3. **[PROJECT-DOCUMENTATION.md](PROJECT-DOCUMENTATION.md)** - Full project technical docs

---

## 🛠️ Troubleshooting

### Issue: Redirect URI Mismatch
**Error**: `AADSTS50011: The redirect URI ... does not match`
**Solution**: Contact Judy to add the redirect URI to App Registration

### Issue: User Sees Dashboard But No Welcome Message
**Cause**: Frontend code not deployed or `/.auth/me` endpoint not working
**Solution**:
```bash
# Check deployment status
gh run list --limit 1

# Test /.auth/me endpoint
curl https://roomres.thebattenspace.org/.auth/me
```

### Issue: No Group Roles in Token
**Cause**: User not in `FBS_StaffAll` or `FBS_Community` groups
**Solution**:
1. Verify user is in correct Azure AD groups
2. Check Token configuration in App Registration
3. Test in browser console:
```javascript
fetch('/.auth/me')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Issue: Authentication Not Working After Adding Redirect URI
**Solution**: Wait 5 minutes for Azure AD to propagate changes, then test again

---

## 📞 Contacts

- **Authentication/Azure Issues**: Judy (UVA IT Azure team)
- **Application Issues**: Ben Hartless (bh4hb@virginia.edu)
- **GitHub Repository**: https://github.com/BattenIT/RoomTool

---

## 🚀 Future Enhancements

### 1. Main Landing Page (thebattenspace.org)
**Purpose**: Central hub for all Batten School digital tools

**Options for Landing Page**:
- **Option A - Public Landing Page**:
  - No authentication required to view available tools
  - Click on tool → redirect to subdomain → requires login
  - Good for discoverability

- **Option B - Protected Landing Page**:
  - Requires login to see available tools
  - More secure, only authenticated users see what's available
  - Better for internal-only tools

**Recommended Approach**: Option A (public landing with protected tools)

**Landing Page Features**:
- List of available tools with descriptions
- Links to each subdomain (roomres, appexplorer, etc.)
- UVA/Batten branding
- Simple, clean interface

**Technical Setup**:
- Create new Static Web App for main landing page
- Point `thebattenspace.org` to this app
- No authentication needed on landing page itself
- Each tool subdomain handles its own authentication

### 2. Shared Authentication Across Tools
**Current Setup**: Each tool uses same App Registration (Client ID: 0b45a06e-6b4a-4c3e-80ff-01d0c11a9def)

**Benefit**: Single sign-on (SSO) experience
- User logs in to Room Booking Tool
- Visits App Explorer Tool
- Already authenticated (no need to log in again)

**Requirement**: Each subdomain needs redirect URI added to App Registration

**When Adding New Tools**:
1. Create subdomain (e.g., `newtool.thebattenspace.org`)
2. Deploy as Azure Static Web App
3. Configure same authentication (Client ID, Secret)
4. Contact Judy to add redirect URI: `https://newtool.thebattenspace.org/.auth/login/aad/callback`

### 3. Optional: Managed Identity for Secret Access
- More secure than storing secret in app settings
- Azure handles authentication automatically
- Contact Judy to set up
- Applies to all tools using same App Registration

### 4. Role-Based Access for Different Tools
**Current**: Both groups (FBS_StaffAll, FBS_Community) have same access

**Future Possibilities**:
- Some tools only for FBS_StaffAll (admin tools)
- Some tools for both groups (like room booking)
- Some tools for specific sub-groups

**Implementation**: Use `hasRole()` function in each tool's JavaScript
```javascript
if (dashboard.isStaff()) {
  // Show admin features
}
```

---

**Setup Date**: October 17, 2025
**Configured By**: Ben Hartless
**Status**: Awaiting redirect URI addition from Judy
**Next Action**: Email Judy to add `https://roomres.thebattenspace.org/.auth/login/aad/callback`
