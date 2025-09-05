import datetime
import logging
import json
import os
from azure.storage.blob import BlobServiceClient
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Debug status endpoint called')
    
    debug_info = {
        'timestamp': datetime.datetime.utcnow().isoformat(),
        'environment': {},
        'blob_storage': {},
        'timer_info': {}
    }
    
    # Check environment variables
    storage_conn = os.environ.get('AzureWebJobsStorage')
    debug_info['environment']['has_storage_connection'] = storage_conn is not None
    debug_info['environment']['storage_connection_preview'] = storage_conn[:50] + '...' if storage_conn else None
    
    # Check other relevant env vars
    debug_info['environment']['function_app_name'] = os.environ.get('WEBSITE_SITE_NAME', 'unknown')
    debug_info['environment']['functions_version'] = os.environ.get('FUNCTIONS_EXTENSION_VERSION', 'unknown')
    
    # Check blob storage
    if storage_conn:
        try:
            blob_service_client = BlobServiceClient.from_connection_string(storage_conn)
            container_name = 'calendar-cache'
            
            # Check if container exists
            try:
                container_client = blob_service_client.get_container_client(container_name)
                container_props = container_client.get_container_properties()
                debug_info['blob_storage']['container_exists'] = True
                debug_info['blob_storage']['container_created'] = container_props.last_modified.isoformat()
            except Exception as e:
                debug_info['blob_storage']['container_exists'] = False
                debug_info['blob_storage']['container_error'] = str(e)
            
            # List blobs in container
            try:
                blobs = list(blob_service_client.get_container_client(container_name).list_blobs())
                debug_info['blob_storage']['blob_count'] = len(blobs)
                debug_info['blob_storage']['blobs'] = []
                
                for blob in blobs[:10]:  # Show first 10 blobs
                    blob_info = {
                        'name': blob.name,
                        'size': blob.size,
                        'last_modified': blob.last_modified.isoformat() if blob.last_modified else None
                    }
                    # Get metadata
                    try:
                        blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob.name)
                        props = blob_client.get_blob_properties()
                        blob_info['metadata'] = props.metadata
                    except:
                        pass
                    debug_info['blob_storage']['blobs'].append(blob_info)
                        
            except Exception as e:
                debug_info['blob_storage']['list_error'] = str(e)
                
        except Exception as e:
            debug_info['blob_storage']['connection_error'] = str(e)
    
    # Check for refresh summary
    if storage_conn:
        try:
            blob_client = blob_service_client.get_blob_client(container='calendar-cache', blob='refresh-summary.json')
            summary_data = blob_client.download_blob().readall().decode('utf-8')
            debug_info['timer_info']['last_refresh_summary'] = json.loads(summary_data)
        except Exception as e:
            debug_info['timer_info']['summary_error'] = str(e)
    
    return func.HttpResponse(
        json.dumps(debug_info, indent=2),
        status_code=200,
        headers={'Content-Type': 'application/json'}
    )