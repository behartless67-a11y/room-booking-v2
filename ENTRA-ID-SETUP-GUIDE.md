# Azure Entra ID (Azure AD) Authentication Setup Guide

## Overview

This guide walks you through configuring Azure Entra ID authentication for the BattenSpace application. After completing these steps, users will be required to log in with their UVA credentials to access the dashboard.

**Authentication Flow:**
1. User visits `https://www.thebattenspace.org`
2. Azure Static Web Apps redirects to Microsoft/UVA login
3. User enters UVA credentials
4. After authentication, user is redirected back to dashboard
5. User's group membership is checked (`FBS_StaffAll` or `FBS_Community`)
6. Dashboard displays with user's name and logout button

---

## Prerequisites

From Judy's email, you have:
- **Client ID**: `0b45a06e-6b4a-4c3e-80ff-01d0c11a9def`
- **Client Secret**: Stored in Azure Key Vault (see below)
- **Tenant ID**: `7b3480c7-3707-4873-8b77-e216733a65ac`
- **Groups**: `FBS_StaffAll`, `FBS_Community`
- **App Registration**: Already configured by Judy with redirect URIs

---

## Part 1: Retrieve Client Secret from Key Vault

### Access Key Vault (Use eservices account, NOT SA account)

1. **Open Key Vault in Azure Portal**:
   - Go to: https://portal.azure.com/#@myuva.onmicrosoft.com/asset/Microsoft_Azure_KeyVault/Secret/https://eieide2kv.vault.azure.net/secrets/kvs-6582dc3a-472c-4589-8f88-d4025fc47bfe/de56ef8f000e4b6badb6dc5be56f7ef5
   - Log in with your **eservices account** (not SA account)

2. **Copy the Secret Value**:
   - Click "Show Secret Value"
   - Copy the entire secret string
   - **Keep this secure** - you'll use it in Part 2

3. **Important Note**:
   - You'll receive an email every 6 months when the secret is rotated
   - You'll need to update the secret in Azure Static Web Apps configuration when that happens

---

## Part 2: Configure Azure Static Web App Authentication

### Step 1: Open Static Web App in Azure Portal

```bash
# Navigate to your Static Web App
https://portal.azure.com/
→ Search for "Static Web Apps"
→ Select "nice-dune-0d695b810" (or your app name)
```

### Step 2: Configure Custom Authentication

1. **Navigate to Configuration**:
   - In the left menu, click **"Configuration"**
   - Click **"Authentication"** section

2. **Add Azure Active Directory Provider**:
   - Click **"Add"** under Identity Providers
   - Select **"Azure Active Directory"**
   - Choose **"Custom"** (not Express)

3. **Enter Authentication Settings**:

   | Field | Value |
   |-------|-------|
   | **App Registration Type** | Custom |
   | **Client ID** | `0b45a06e-6b4a-4c3e-80ff-01d0c11a9def` |
   | **OpenID Connect Issuer** | `https://login.microsoftonline.com/7b3480c7-3707-4873-8b77-e216733a65ac/v2.0` |
   | **Allowed Token Audiences** | `0b45a06e-6b4a-4c3e-80ff-01d0c11a9def` |

4. **Add Client Secret**:
   - Under **"Client Secret Settings"**:
   - Click **"Add"** to add application setting
   - **Name**: `AAD_CLIENT_SECRET`
   - **Value**: Paste the secret you copied from Key Vault
   - Click **"OK"**

5. **Save Configuration**:
   - Click **"Save"** at the top
   - Wait for deployment to complete (~30 seconds)

### Step 3: Verify Redirect URIs (Already configured by Judy)

These should already be set in the App Registration:
- `https://appexplorer.thebattenspace.org/.auth/login/aad/callback`
- `https://calm-rock-0599eab0f.1.azurestaticapps.net/.auth/login/aad/callback`
- `https://www.thebattenspace.org/.auth/login/aad/callback`

**To verify**:
1. Go to Azure Portal → App Registrations
2. Search for Client ID: `0b45a06e-6b4a-4c3e-80ff-01d0c11a9def`
3. Click **"Authentication"** in left menu
4. Verify the URIs above are listed under "Redirect URIs"

---

## Part 3: Deploy GetUserRoles Azure Function

The `GetUserRoles` function reads group claims from Azure AD and maps them to application roles.

### Step 1: Deploy the Function

```bash
# Navigate to azure-function directory
cd azure-function

# Deploy to Azure Functions
func azure functionapp publish roomtool-calendar-function --python
```

### Step 2: Verify Function Deployment

```bash
# Test the function endpoint
curl https://roomtool-calendar-function.azurewebsites.net/api/GetUserRoles
```

Expected response (when not authenticated):
```json
{"roles": []}
```

### Step 3: Configure Function in Static Web App

1. **Link Function to Static Web App**:
   - In Azure Portal, go to your Static Web App
   - Click **"APIs"** in left menu
   - Click **"Link"**
   - Select **"Link an existing function"**
   - Choose `roomtool-calendar-function`
   - Click **"Link"**

---

## Part 4: Deploy Updated Frontend Code

The frontend code has been updated with:
- `staticwebapp.config.json` - Authentication configuration
- `dashboard.js` - User info display and role checking
- `styles.css` - User info styling

### Deploy via Git Push (Automatic)

```bash
# From project root
git add .
git commit -m "Add Azure Entra ID authentication with group-based access"
git push origin main
```

**Deployment process:**
- GitHub Actions triggers automatically
- Azure Static Web Apps deploys within 2-3 minutes
- Zero downtime deployment

### Monitor Deployment

- **GitHub**: https://github.com/BattenIT/RoomTool/actions
- **Azure Portal**: Static Web Apps → Deployment History

---

## Part 5: Testing Authentication

### Test Login Flow

1. **Open Dashboard** (incognito/private window):
   ```
   https://www.thebattenspace.org
   ```

2. **Expected Behavior**:
   - Redirects to Microsoft login
   - Shows UVA/myUVA login page
   - After login, redirects back to dashboard
   - Dashboard displays: "Welcome, [Your Name]" with Logout button

3. **Test User Info**:
   - Open browser console (F12)
   - Check for log messages:
     ```
     Authenticated user: [username]
     User roles: ["staff", "authenticated"] or ["community", "authenticated"]
     ```

### Test Group Membership

**For FBS_StaffAll members:**
```javascript
// In browser console
dashboard.isStaff()  // Should return true
dashboard.userInfo.userRoles  // Should include "staff"
```

**For FBS_Community members:**
```javascript
// In browser console
dashboard.isCommunity()  // Should return true
dashboard.userInfo.userRoles  // Should include "community"
```

### Test Logout

1. Click **"Logout"** button
2. Should redirect to `/.auth/logout`
3. Session cleared, user logged out
4. Visiting site again requires re-authentication

---

## Part 6: Verify Group Claims Configuration

### Check Token Configuration (Already done by Judy)

1. **In App Registration**:
   - Azure Portal → App Registrations
   - Select your app (Client ID: `0b45a06e-6b4a-4c3e-80ff-01d0c11a9def`)
   - Click **"Token configuration"**

2. **Verify Claims**:
   - **Groups claim** should be enabled
   - **"Emit groups as role claims"** should be checked
   - This ensures groups appear in the `roles` claim

---

## Troubleshooting

### Issue: Redirect Loop After Login

**Cause**: Static Web App configuration not saved properly

**Solution**:
1. Go to Static Web App → Configuration
2. Re-save authentication settings
3. Wait 1 minute for propagation

### Issue: User Sees Dashboard But No Welcome Message

**Cause**: Frontend code not deployed or `/.auth/me` endpoint not working

**Solution**:
```bash
# Check deployment status
gh workflow view

# Test /.auth/me endpoint
curl https://www.thebattenspace.org/.auth/me
```

### Issue: No Group Roles in Token

**Cause**: User not in `FBS_StaffAll` or `FBS_Community` groups

**Solution**:
1. Verify user is in correct Azure AD groups
2. Check Token configuration in App Registration
3. Test with browser console:
   ```javascript
   fetch('/.auth/me')
     .then(r => r.json())
     .then(d => console.log(d))
   ```

### Issue: 401 Unauthorized Error

**Cause**: Authentication not configured or secret incorrect

**Solution**:
1. Verify `AAD_CLIENT_SECRET` is set correctly
2. Check OpenID Connect Issuer URL is correct
3. Verify redirect URIs match exactly

### Issue: Function Not Mapping Roles

**Cause**: GetUserRoles function not deployed or not linked

**Solution**:
```bash
# Redeploy function
cd azure-function
func azure functionapp publish roomtool-calendar-function --python

# Check function logs
az functionapp log tail --name roomtool-calendar-function --resource-group [your-rg]
```

---

## Optional: Managed Identity for Secret Access

Judy mentioned setting up Managed Identity (MSI) for automatic secret access. This is more secure than manually storing the secret.

### Benefits:
- No manual secret rotation needed
- Azure handles authentication automatically
- More secure (no secret in app settings)

### To Enable (Contact Judy):
1. Request MSI setup for Static Web App
2. Judy will grant MSI access to Key Vault
3. Update Static Web App configuration to use MSI

---

## How to Display Dynamic User Info in Header

### Overview
The header dynamically displays the logged-in user's name and role from Azure Entra ID authentication. This approach can be reused in other applications.

### Implementation Steps

**1. HTML Structure**
Add a div with an ID to target from JavaScript:
```html
<div class="user-info" id="headerUserInfo">
    <span class="user-name">Loading...</span>
    <span class="user-role"></span>
</div>
```

**2. JavaScript to Fetch User Info**
Add this function to fetch and display user data from Azure Static Web Apps authentication:

```javascript
async function loadHeaderUserInfo() {
    try {
        const response = await fetch('/.auth/me');
        const payload = await response.json();
        const userInfo = payload.clientPrincipal;

        if (userInfo) {
            // Extract display name from claims or userDetails
            let displayName = userInfo.userDetails;

            // Try to get name from claims first (best approach)
            const claims = userInfo.claims;
            if (claims) {
                const givenName = claims.find(c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname')?.val;
                const surname = claims.find(c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname')?.val;

                if (givenName && surname) {
                    displayName = `${givenName} ${surname}`;
                } else {
                    // Try alternative claim types
                    const name = claims.find(c => c.typ === 'name' || c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name')?.val;
                    if (name) displayName = name;

                    const displayNameClaim = claims.find(c => c.typ === 'http://schemas.microsoft.com/identity/claims/displayname')?.val;
                    if (displayNameClaim) displayName = displayNameClaim;
                }
            }

            // If it's an email, extract the name part before @
            if (displayName.includes('@')) {
                const namePart = displayName.split('@')[0];
                // Convert something like "john.doe" to "John Doe"
                displayName = namePart.split('.').map(part =>
                    part.charAt(0).toUpperCase() + part.slice(1)
                ).join(' ');
            }

            // Extract and format roles (filter out 'anonymous' and 'authenticated')
            const roles = userInfo.userRoles.filter(role => role !== 'anonymous' && role !== 'authenticated');
            const roleDisplay = roles.join(', ') || 'Staff';

            // Update header elements
            const userInfoDiv = document.getElementById('headerUserInfo');
            if (userInfoDiv) {
                userInfoDiv.innerHTML = `
                    <span class="user-name">${displayName}</span>
                    <span class="user-role">${roleDisplay}</span>
                `;
            }

            console.log('Authenticated user:', displayName, 'Roles:', roleDisplay);
        } else {
            console.log('No authenticated user found');
            // If not authenticated, show generic message
            const userInfoDiv = document.getElementById('headerUserInfo');
            if (userInfoDiv) {
                userInfoDiv.innerHTML = `
                    <span class="user-name">Guest</span>
                    <span class="user-role"></span>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        // On error, hide loading message
        const userInfoDiv = document.getElementById('headerUserInfo');
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `
                <span class="user-name">Error loading user</span>
                <span class="user-role"></span>
            `;
        }
    }
}

// Load user info when page loads
document.addEventListener('DOMContentLoaded', loadHeaderUserInfo);
```

**3. CSS Styling**
```css
.user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.125rem;
    text-align: right;
}

.user-name {
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
}

.user-role {
    font-family: 'Inter', sans-serif;
    font-size: 0.75rem;
    font-weight: 400;
    color: #d1d5db;
}
```

**4. Key Points**
- The `/.auth/me` endpoint is provided by Azure Static Web Apps authentication
- It returns user info including claims and roles
- Claims provide the most accurate user name (givenname/surname from Azure AD)
- Fallback to userDetails if claims aren't available
- Filter roles to exclude default 'anonymous' and 'authenticated' values
- Handle errors gracefully to avoid breaking the UI

**5. Testing**
```javascript
// In browser console, test the endpoint
fetch('/.auth/me')
  .then(r => r.json())
  .then(d => console.log(d))
```

This approach works for any application using Azure Static Web Apps with Azure Entra ID authentication.

---

## Files Modified in This Implementation

```
/
├── staticwebapp.config.json          # NEW - Auth configuration
├── azure-function/
│   └── GetUserRoles/                 # NEW - Role mapping function
│       ├── __init__.py
│       └── function.json
├── dashboard.js                      # MODIFIED - User info display
├── index.html                        # MODIFIED - Dynamic header user info
├── styles.css                        # MODIFIED - User info styling
└── ENTRA-ID-SETUP-GUIDE.md          # NEW - This guide
```

---

## Security Notes

1. **Client Secret**: Never commit to git, stored in Key Vault only
2. **Group Membership**: Managed in Azure AD by administrators
3. **Redirect URIs**: Must match exactly (already configured)
4. **Token Audience**: Must match Client ID
5. **HTTPS Only**: All traffic uses HTTPS automatically

---

## Next Steps After Setup

1. ✅ Test with your eservices account
2. ✅ Test with a colleague's account (both groups)
3. ✅ Monitor logs for any authentication errors
4. ✅ Set calendar reminder for secret rotation (6 months)
5. ✅ Consider Managed Identity for production (contact Judy)

---

## Support

**Authentication Issues**: Contact Judy or UVA IT Azure team
**Application Issues**: Check [PROJECT-DOCUMENTATION.md](PROJECT-DOCUMENTATION.md)
**GitHub Repository**: https://github.com/BattenIT/RoomTool

---

**Setup Date**: _______________
**Configured By**: _______________
**Next Secret Rotation**: _______________ (6 months from now)
