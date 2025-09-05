import datetime
import logging
import requests
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Test function executed.')
    
    # Test fetching one of the calendar URLs
    test_url = 'https://outlook.office365.com/owa/calendar/4207f27aa0d54d318d660537325a3856@virginia.edu/64228c013c3c425ca3ec6682642a970e8523251041637520167/calendar.ics'
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/calendar,application/calendar,text/plain,*/*',
            'Accept-Language': 'en-US,en;q=0.9'
        }
        
        response = requests.get(test_url, headers=headers, timeout=10, allow_redirects=True)
        
        result = {
            'status_code': response.status_code,
            'content_length': len(response.text) if response.text else 0,
            'content_preview': response.text[:200] if response.text else 'No content',
            'headers': dict(response.headers),
            'url': response.url
        }
        
        logging.info(f'Calendar fetch result: {result}')
        
        return func.HttpResponse(
            f"Test Result:\nStatus: {result['status_code']}\nContent Length: {result['content_length']}\nFinal URL: {result['url']}\nPreview: {result['content_preview']}",
            status_code=200
        )
        
    except Exception as e:
        logging.error(f'Error testing calendar fetch: {str(e)}')
        return func.HttpResponse(f'Error: {str(e)}', status_code=500)