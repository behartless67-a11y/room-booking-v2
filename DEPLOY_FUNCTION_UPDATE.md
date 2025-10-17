# 🚀 Deploy Azure Function Update - Student Lounge 206

## Option 1: Azure Portal (Recommended - 2 minutes)

### Step 1: Access Azure Function
1. Go to [portal.azure.com](https://portal.azure.com)
2. Search for `roomtool-calendar-function`
3. Click on the Function App

### Step 2: Edit Function Code
1. Click **Functions** in the left menu
2. Click **getcalendar** function
3. Click **Code + Test** in the left menu

### Step 3: Update Room Mappings
Find the `roomMappings` object and add this line:
```javascript
"studentlounge206": "https://outlook.office365.com/owa/calendar/bfd63ea7933c4c3d965a632e5d6b703d@virginia.edu/05f41146b7274347a5e374b91f0e7eda6953039659626971784/calendar.ics",
```

**IMPORTANT**: Add a comma after the previous line!

### Step 4: Save Changes
1. Click **Save** at the top
2. Wait for "Successfully saved" message

---

## Option 2: Replace Entire Function Code

If you prefer to replace the entire function code, use the content from `index.js` in this directory.

The updated function includes:
- ✅ All existing room mappings
- ✅ **NEW**: Student Lounge 206 mapping added
- ✅ CORS headers for web access
- ✅ Error handling and logging

---

## Option 3: PowerShell Script (Advanced)

If you want to try the CLI approach again, you can use:

```powershell
# Login to Azure
az login

# Find the function app (may require different subscription)
az functionapp list --query "[?contains(name,'roomtool')]" --output table

# Deploy the function (once found)
az functionapp deployment source config-zip --resource-group <RESOURCE_GROUP> --name roomtool-calendar-function --src function.zip
```

---

## ✅ Testing the Update

After deployment, test Student Lounge 206:
```
https://roomtool-calendar-function.azurewebsites.net/api/getcalendar?room=studentlounge206
```

**Expected Result**: ICS calendar data (not error message)

---

## 🎯 What This Fixes

- **Before**: Student Lounge 206 shows as "available" (no calendar data)
- **After**: Student Lounge 206 shows real calendar events and availability

**Estimated Time**: 2-5 minutes
**Impact**: Completes Student Lounge 206 integration