#!/usr/bin/env python3
"""
Fetch calendar ICS files and save them as static files.
This script is run by GitHub Actions every 15 minutes.
"""

import requests
import os
from datetime import datetime

# Calendar URLs from config.js
CALENDARS = {
    'confa': 'https://outlook.office365.com/owa/calendar/4207f27aa0d54d318d660537325a3856@virginia.edu/64228c013c3c425ca3ec6682642a970e8523251041637520167/calendar.ics',
    'greathall': 'https://outlook.office365.com/owa/calendar/cf706332e50c45009e2b3164e0b68ca0@virginia.edu/6960c19164584f9cbb619329600a490a16019380931273154626/calendar.ics',
    'seminar': 'https://outlook.office365.com/owa/calendar/4cedc3f0284648fcbee80dd7f6563bab@virginia.edu/211f4d478ee94feb8fe74fa4ed82a0b22636302730039956374/calendar.ics',
    'studentlounge206': 'https://outlook.office365.com/owa/calendar/bfd63ea7933c4c3d965a632e5d6b703d@virginia.edu/05f41146b7274347a5e374b91f0e7eda6953039659626971784/calendar.ics',
    'pavx-upper': 'https://outlook.office365.com/owa/calendar/52b9b2d41868473fac5d3e9963512a9b@virginia.edu/311e34fd14384759b006ccf185c1db677813060047149602177/calendar.ics',
    'pavx-b1': 'https://outlook.office365.com/owa/calendar/fa3ecb9b47824ac0a36733c7212ccc97@virginia.edu/d23afabf93da4fa4b49d2be3ce290f7911116129854936607531/calendar.ics',
    'pavx-b2': 'https://outlook.office365.com/owa/calendar/3f60cb3359dd40f7943b9de3b062b18d@virginia.edu/1e78265cf5eb44da903745ca3d872e6910017444746788834359/calendar.ics',
    'pavx-exhibit': 'https://outlook.office365.com/owa/calendar/4df4134c83844cef9d9357180ccfb48c@virginia.edu/e46a84ae5d8842d4b33a842ddc5ff66c11207228220277930183/calendar.ics',
    'staff-ooo': 'https://www.trumba.com/calendars/staff-ooo.ics'
}

OUTPUT_DIR = 'calendars'

def fetch_calendar(room_id, url):
    """Fetch a calendar and save it to a file."""
    print(f'Fetching {room_id}...')

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/calendar,application/calendar,text/plain,*/*',
        'Cache-Control': 'no-cache'
    }

    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()

        if response.text:
            # Save to file
            output_file = os.path.join(OUTPUT_DIR, f'{room_id}.ics')
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(response.text)

            print(f'[OK] {room_id}: {len(response.text)} bytes')
            return True
        else:
            print(f'[FAIL] {room_id}: Empty response')
            return False

    except Exception as e:
        print(f'[FAIL] {room_id}: {str(e)}')
        return False

def main():
    """Fetch all calendars."""
    print(f'Starting calendar fetch at {datetime.utcnow().isoformat()}')

    # Create output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    successful = 0
    failed = 0

    for room_id, url in CALENDARS.items():
        if fetch_calendar(room_id, url):
            successful += 1
        else:
            failed += 1

    print(f'\nCompleted: {successful} successful, {failed} failed')

    # Write summary file
    summary = {
        'last_updated': datetime.utcnow().isoformat(),
        'successful': successful,
        'failed': failed,
        'total': len(CALENDARS)
    }

    import json
    summary_file = os.path.join(OUTPUT_DIR, 'last-update.json')
    with open(summary_file, 'w') as f:
        json.dump(summary, f, indent=2)

    print(f'Summary written to {summary_file}')

if __name__ == '__main__':
    main()
