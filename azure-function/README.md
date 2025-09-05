# Azure Function Calendar Refresh System

This Azure Function provides automated calendar refresh for the RoomTool application, updating calendar data every 15 minutes and serving cached results.

## Architecture

### Timer Function (`CalendarRefresh`)
- **Trigger**: Timer (every 15 minutes: `0 */15 * * * *`)
- **Purpose**: Fetches fresh calendar data from Outlook URLs and stores in Azure Blob Storage
- **Storage**: Uses `calendar-cache` container in Azure Blob Storage

### HTTP Function (`GetCalendar`)
- **Trigger**: HTTP GET request
- **Purpose**: Serves cached calendar data to the RoomTool application
- **Endpoint**: `GET /api/GetCalendar?room={room_id}`

## Room ID Mapping

The function uses the following room ID mapping:

| Room ID | Room Name | Original Calendar ID |
|---------|-----------|---------------------|
| `confa` | Conference Room A L014 | 4207f27aa0d54d318d660537325a3856 |
| `greathall` | Great Hall 100 | cf706332e50c45009e2b3164e0b68ca0 |
| `seminar` | Seminar Room L039 | 4cedc3f0284648fcbee80dd7f6563bab |
| `pavx-upper` | Pavilion X Upper Garden | 52b9b2d41868473fac5d3e9963512a9b |
| `pavx-b1` | Pavilion X Basement Room 1 | fa3ecb9b47824ac0a36733c7212ccc97 |
| `pavx-b2` | Pavilion X Basement Room 2 | 3f60cb3359dd40f7943b9de3b062b18d |
| `pavx-exhibit` | Pavilion X Basement Exhibit | 4df4134c83844cef9d9357180ccfb48c |

## Deployment

### Prerequisites
1. Azure CLI installed and authenticated
2. Azure Functions Core Tools installed (`npm install -g azure-functions-core-tools@4`)

### Deploy
```bash
cd azure-function
chmod +x deploy.sh
./deploy.sh
```

The deployment script will:
1. Create a resource group
2. Create a storage account
3. Create the Function App
4. Deploy the function code

### Manual Deployment
```bash
# Create resource group
az group create --name roomtool-rg --location eastus

# Create storage account  
az storage account create \
    --resource-group roomtool-rg \
    --name roomtoolstorage \
    --location eastus \
    --sku Standard_LRS

# Create Function App
az functionapp create \
    --resource-group roomtool-rg \
    --consumption-plan-location eastus \
    --runtime python \
    --runtime-version 3.9 \
    --functions-version 4 \
    --name roomtool-calendar-function \
    --storage-account roomtoolstorage \
    --os-type Linux

# Deploy function code
func azure functionapp publish roomtool-calendar-function --python
```

## Configuration

### Update RoomTool Configuration
After deployment, update your `config.js`:

```javascript
window.DashboardConfig = {
    azureFunctionUrl: "https://YOUR_FUNCTION_APP_NAME.azurewebsites.net/api/GetCalendar",
    // ... rest of config
};
```

### Environment Variables
The function uses the following environment variables (automatically set by Azure):
- `AzureWebJobsStorage`: Connection string for blob storage

## API Usage

### Get Calendar Data
```
GET /api/GetCalendar?room={room_id}
```

**Parameters:**
- `room`: Room ID (e.g., `confa`, `greathall`, `seminar`)

**Response:**
- Content-Type: `text/calendar`
- Body: ICS calendar data
- Headers:
  - `X-Last-Updated`: Timestamp of last refresh
  - `Cache-Control`: `public, max-age=900` (15 minutes)

**Example:**
```bash
curl "https://roomtool-calendar-function.azurewebsites.net/api/GetCalendar?room=confa"
```

## Monitoring

### Check Refresh Status
The function stores a summary of each refresh in `refresh-summary.json`:

```json
{
  "last_refresh": "2025-01-15T10:15:00.000Z",
  "successful_updates": 7,
  "failed_updates": 0,
  "total_calendars": 7
}
```

### Logs
Monitor function execution in Azure Portal:
1. Go to your Function App
2. Navigate to Functions → Monitor
3. View execution logs and metrics

## Benefits

1. **Reliability**: Cached data ensures the app works even if Outlook is temporarily unavailable
2. **Performance**: Faster loading times with pre-cached data
3. **Rate Limiting**: Reduces direct calls to Outlook calendar URLs
4. **Monitoring**: Centralized logging and refresh status tracking
5. **Scalability**: Azure Functions automatically scale based on demand

## Troubleshooting

### Function Not Triggering
- Check the timer expression in `function.json`
- Verify the Function App is running in Azure Portal

### Calendar Data Not Updating
- Check Azure Function logs for errors
- Verify storage account connectivity
- Test calendar URLs manually

### API Returning 404
- Ensure the room ID exists in the mapping
- Check that the blob was created during the last refresh
- Verify storage container exists (`calendar-cache`)