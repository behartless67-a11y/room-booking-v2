# BattenSpace Tool Suite Architecture

## Domain Structure

```
┌─────────────────────────────────────────────────────────────┐
│                  thebattenspace.org                         │
│                                                             │
│              Main Landing Page (Public)                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  Welcome to BattenSpace Digital Tools               │   │
│  │                                                     │   │
│  │  Available Tools:                                   │   │
│  │                                                     │   │
│  │  📅 Room Booking                                    │   │
│  │     View and manage room availability               │   │
│  │     → roomres.thebattenspace.org                    │   │
│  │                                                     │   │
│  │  🔍 App Explorer                                    │   │
│  │     Discover and launch applications                │   │
│  │     → appexplorer.thebattenspace.org                │   │
│  │                                                     │   │
│  │  [Future Tools...]                                  │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Click on tool
                              ▼
        ┌─────────────────────────────────────────┐
        │                                         │
        │    Tool-Specific Static Web App         │
        │    (e.g., roomres.thebattenspace.org)   │
        │                                         │
        │    1. Not authenticated?                │
        │       → Redirect to UVA Login           │
        │                                         │
        │    2. Login successful                  │
        │       → Return to tool                  │
        │                                         │
        │    3. Show tool with user info          │
        │       "Welcome, [Name]" + Logout        │
        │                                         │
        └─────────────────────────────────────────┘
```

## Authentication Flow

```
User Journey:
1. Visit thebattenspace.org
   └→ No authentication required
   └→ See list of available tools

2. Click "Room Booking"
   └→ Redirect to roomres.thebattenspace.org
   └→ Check authentication status

3. Not authenticated?
   └→ Redirect to login.microsoftonline.com (UVA SSO)
   └→ Redirect URI: https://roomres.thebattenspace.org/.auth/login/aad/callback

4. Login successful
   └→ Azure AD returns to callback URI
   └→ Static Web App sets authentication cookie
   └→ User sees dashboard with "Welcome, [Name]"

5. Click on another tool (e.g., App Explorer)
   └→ Already authenticated! (SSO)
   └→ No login required
   └→ Direct access to tool
```

## Technical Architecture

### Azure Resources

```
┌─────────────────────────────────────────────────────────────┐
│                  Azure Subscription                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Static Web Apps (Webtools Resource Group)            │  │
│  │                                                      │  │
│  │  • batten-landing (thebattenspace.org)              │  │
│  │    - Public landing page                            │  │
│  │    - No authentication                              │  │
│  │                                                      │  │
│  │  • room-booking (roomres.thebattenspace.org)        │  │
│  │    - Room availability dashboard                    │  │
│  │    - Requires authentication                        │  │
│  │                                                      │  │
│  │  • app-explorer (appexplorer.thebattenspace.org)    │  │
│  │    - App discovery tool                             │  │
│  │    - Requires authentication                        │  │
│  │                                                      │  │
│  │  [Future apps...]                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Azure Functions                                      │  │
│  │                                                      │  │
│  │  • roomtool-calendar-function                       │  │
│  │    - CalendarRefresh (timer trigger)                │  │
│  │    - GetCalendar (HTTP trigger)                     │  │
│  │    - GetUserRoles (HTTP trigger) ← AUTH             │  │
│  │    - ManualRefresh (HTTP trigger)                   │  │
│  │                                                      │  │
│  │  [Future functions...]                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Azure AD App Registration                            │  │
│  │                                                      │  │
│  │  Client ID: 0b45a06e-6b4a-4c3e-80ff-01d0c11a9def    │  │
│  │  Tenant: UVA (7b3480c7-3707-4873-8b77-e216733a65ac) │  │
│  │                                                      │  │
│  │  Redirect URIs:                                      │  │
│  │  • appexplorer.thebattenspace.org/.auth/.../callback│  │
│  │  • www.thebattenspace.org/.auth/.../callback        │  │
│  │  • roomres.thebattenspace.org/.auth/.../callback    │  │
│  │    ↑ NEEDS TO BE ADDED                               │  │
│  │                                                      │  │
│  │  Groups:                                             │  │
│  │  • FBS_StaffAll                                      │  │
│  │  • FBS_Community                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Single Sign-On (SSO) Behavior

All tools use the **same App Registration**, providing SSO:

```
Scenario 1: First Visit
User → roomres.thebattenspace.org → Login required → UVA SSO → Authenticated
User → appexplorer.thebattenspace.org → Already authenticated ✓

Scenario 2: Session Timeout
User → roomres.thebattenspace.org → Session expired → Login required
User logs in → Both apps are authenticated again

Scenario 3: Logout
User clicks Logout in Room Booking → Logged out of all apps
User → appexplorer.thebattenspace.org → Login required
```

## Adding New Tools - Checklist

When creating a new tool under BattenSpace:

- [ ] **1. Create subdomain** (e.g., `newtool.thebattenspace.org`)
  - Work with UVA IT to set up DNS

- [ ] **2. Create Azure Static Web App**
  ```bash
  az staticwebapp create \
    --name newtool \
    --resource-group Webtools \
    --location eastus
  ```

- [ ] **3. Configure custom domain**
  - Azure Portal → Static Web App → Custom domains
  - Add `newtool.thebattenspace.org`

- [ ] **4. Add authentication configuration**
  - Copy `staticwebapp.config.json` from room-booking
  - Update routes if needed
  - Deploy to GitHub

- [ ] **5. Configure environment variables**
  - Azure Portal → Static Web App → Environment variables
  - Add `AAD_CLIENT_ID`: `0b45a06e-6b4a-4c3e-80ff-01d0c11a9def`
  - Add `AAD_CLIENT_SECRET`: [Retrieve from Azure Key Vault `eieide2kv`]

- [ ] **6. Request redirect URI addition**
  - Email Judy (or UVA IT Azure team)
  - Request: `https://newtool.thebattenspace.org/.auth/login/aad/callback`

- [ ] **7. Test authentication**
  - Incognito browser → newtool.thebattenspace.org
  - Should redirect to login
  - Should show "Welcome, [Name]" after login

- [ ] **8. Update landing page**
  - Add new tool to thebattenspace.org
  - Include description and link

## Current Status

### ✅ Completed
- Room Booking tool authentication code implemented
- GetUserRoles Azure Function deployed
- Environment variables configured in Azure Portal

### ⚠️ In Progress
- Waiting for redirect URI to be added by Judy:
  - `https://roomres.thebattenspace.org/.auth/login/aad/callback`

### 📋 Future Work
- Create main landing page (thebattenspace.org)
- Ensure App Explorer has authentication configured
- Plan and build additional tools

## Domain Mapping Reference

| Domain | Azure Static Web App | Status | Authentication |
|--------|---------------------|--------|----------------|
| `thebattenspace.org` | batten-landing (TBD) | Not created | None (public) |
| `roomres.thebattenspace.org` | room-booking | Active | ⚠️ Pending redirect URI |
| `appexplorer.thebattenspace.org` | app-explorer (?) | Active | ✅ Configured |
| `www.thebattenspace.org` | ? | Unknown | ✅ Redirect URI exists |

## Next Steps

1. **Immediate**: Email Judy to add `roomres.thebattenspace.org` redirect URI
2. **Short-term**: Test authentication once URI is added
3. **Medium-term**: Create landing page at `thebattenspace.org`
4. **Long-term**: Build additional tools as needed

---

**Last Updated**: October 17, 2025
**Maintained By**: Ben Hartless (bh4hb@virginia.edu)
