import logging
import json
import os
from azure.storage.blob import BlobServiceClient
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Calendar API request received')

    # Get room ID from query parameter
    room_id = req.params.get('room')
    if not room_id:
        return func.HttpResponse(
            json.dumps({"error": "Missing 'room' parameter"}),
            status_code=400,
            headers={'Content-Type': 'application/json'}
        )

    # Initialize Azure Blob Storage
    storage_connection_string = os.environ.get('AzureWebJobsStorage')
    if not storage_connection_string:
        return func.HttpResponse(
            json.dumps({"error": "Storage not configured"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

    try:
        blob_service_client = BlobServiceClient.from_connection_string(storage_connection_string)
        container_name = 'calendar-cache'
        blob_name = f'{room_id}.ics'
        
        # Get the cached calendar data
        blob_client = blob_service_client.get_blob_client(
            container=container_name, 
            blob=blob_name
        )
        
        blob_data = blob_client.download_blob()
        calendar_content = blob_data.readall().decode('utf-8')
        
        # Get blob metadata for cache info
        blob_properties = blob_client.get_blob_properties()
        last_updated = blob_properties.metadata.get('last_updated', 'unknown')
        
        return func.HttpResponse(
            calendar_content,
            status_code=200,
            headers={
                'Content-Type': 'text/calendar; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Cache-Control': 'public, max-age=900',  # Cache for 15 minutes
                'X-Last-Updated': last_updated
            }
        )
        
    except Exception as e:
        logging.error(f'Error retrieving calendar for room {room_id}: {str(e)}')
        return func.HttpResponse(
            json.dumps({"error": f"Calendar not found for room: {room_id}"}),
            status_code=404,
            headers={'Content-Type': 'application/json'}
        )