import datetime
import logging
import requests
import json
import os
from azure.storage.blob import BlobServiceClient
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Manual calendar refresh triggered')

    # Calendar URLs from your config.js
    calendar_urls = [
        'https://outlook.office365.com/owa/calendar/4207f27aa0d54d318d660537325a3856@virginia.edu/64228c013c3c425ca3ec6682642a970e8523251041637520167/calendar.ics',
        'https://outlook.office365.com/owa/calendar/cf706332e50c45009e2b3164e0b68ca0@virginia.edu/6960c19164584f9cbb619329600a490a16019380931273154626/calendar.ics',
        'https://outlook.office365.com/owa/calendar/4cedc3f0284648fcbee80dd7f6563bab@virginia.edu/211f4d478ee94feb8fe74fa4ed82a0b22636302730039956374/calendar.ics',
        'https://outlook.office365.com/owa/calendar/52b9b2d41868473fac5d3e9963512a9b@virginia.edu/311e34fd14384759b006ccf185c1db677813060047149602177/calendar.ics',
        'https://outlook.office365.com/owa/calendar/fa3ecb9b47824ac0a36733c7212ccc97@virginia.edu/d23afabf93da4fa4b49d2be3ce290f7911116129854936607531/calendar.ics',
        'https://outlook.office365.com/owa/calendar/3f60cb3359dd40f7943b9de3b062b18d@virginia.edu/1e78265cf5eb44da903745ca3d872e6910017444746788834359/calendar.ics',
        'https://outlook.office365.com/owa/calendar/4df4134c83844cef9d9357180ccfb48c@virginia.edu/e46a84ae5d8842d4b33a842ddc5ff66c11207228220277930183/calendar.ics'
    ]

    # Room mapping for better organization
    room_mapping = {
        '4207f27aa0d54d318d660537325a3856': 'confa',
        'cf706332e50c45009e2b3164e0b68ca0': 'greathall',
        '4cedc3f0284648fcbee80dd7f6563bab': 'seminar',
        '52b9b2d41868473fac5d3e9963512a9b': 'pavx-upper',
        'fa3ecb9b47824ac0a36733c7212ccc97': 'pavx-b1',
        '3f60cb3359dd40f7943b9de3b062b18d': 'pavx-b2',
        '4df4134c83844cef9d9357180ccfb48c': 'pavx-exhibit'
    }

    # Initialize Azure Blob Storage
    storage_connection_string = os.environ.get('AzureWebJobsStorage')
    if not storage_connection_string:
        return func.HttpResponse('AzureWebJobsStorage environment variable not set', status_code=500)

    blob_service_client = BlobServiceClient.from_connection_string(storage_connection_string)
    container_name = 'calendar-cache'
    
    # Ensure container exists
    try:
        blob_service_client.create_container(container_name)
        logging.info('Container created or already exists')
    except Exception as e:
        logging.info(f'Container already exists or error creating: {e}')

    successful_updates = 0
    failed_updates = 0
    results = []

    utc_timestamp = datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc).isoformat()

    # Fetch each calendar
    for url in calendar_urls:
        try:
            # Extract room ID from URL
            room_id = None
            for calendar_id, mapped_id in room_mapping.items():
                if calendar_id in url:
                    room_id = mapped_id
                    break
            
            if not room_id:
                # Fallback: use part of URL as ID
                room_id = url.split('/')[-3][:8]

            logging.info(f'Fetching calendar for room: {room_id}')
            
            # Fetch calendar data
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/calendar,application/calendar,text/plain,*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            if response.text:
                # Store in blob storage
                blob_name = f'{room_id}.ics'
                blob_client = blob_service_client.get_blob_client(
                    container=container_name, 
                    blob=blob_name
                )
                
                # Upload the calendar data
                blob_client.upload_blob(
                    response.text, 
                    content_type='text/calendar',
                    overwrite=True,
                    metadata={'last_updated': utc_timestamp, 'room_id': room_id}
                )
                
                logging.info(f'Successfully updated calendar for room {room_id} ({len(response.text)} bytes)')
                results.append(f'✓ {room_id}: {len(response.text)} bytes')
                successful_updates += 1
            else:
                logging.warning(f'Empty response for room {room_id}')
                results.append(f'✗ {room_id}: Empty response')
                failed_updates += 1
                
        except Exception as e:
            logging.error(f'Failed to fetch calendar for URL {url}: {str(e)}')
            results.append(f'✗ {room_id or "unknown"}: {str(e)}')
            failed_updates += 1

    # Store summary metadata
    summary = {
        'last_refresh': utc_timestamp,
        'successful_updates': successful_updates,
        'failed_updates': failed_updates,
        'total_calendars': len(calendar_urls)
    }
    
    try:
        summary_blob = blob_service_client.get_blob_client(
            container=container_name, 
            blob='refresh-summary.json'
        )
        summary_blob.upload_blob(
            json.dumps(summary, indent=2), 
            content_type='application/json',
            overwrite=True
        )
    except Exception as e:
        logging.error(f'Failed to store summary: {str(e)}')

    result_text = f"Manual Calendar Refresh Results:\n\n"
    result_text += f"Successful: {successful_updates}, Failed: {failed_updates}\n\n"
    result_text += "\n".join(results)
    
    logging.info(f'Manual refresh completed: {successful_updates} successful, {failed_updates} failed')
    
    return func.HttpResponse(result_text, status_code=200)