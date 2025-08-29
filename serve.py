#!/usr/bin/env python3
"""
Simple HTTP server for the Room Booking Dashboard
Serves files locally to avoid CORS issues
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

# Configuration
PORT = 8000
DIRECTORY = Path(__file__).parent

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with CORS headers"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        """Add CORS headers to all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200)
        self.end_headers()

def main():
    """Start the local server"""
    os.chdir(DIRECTORY)
    
    with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
        print(f"🚀 Room Booking Dashboard Server")
        print(f"📂 Serving directory: {DIRECTORY}")
        print(f"🌐 Server running at: http://localhost:{PORT}")
        print(f"")
        print(f"📋 Available pages:")
        print(f"   • Main Dashboard: http://localhost:{PORT}/dashboard.html")
        print(f"   • Advanced Dashboard: http://localhost:{PORT}/room-dashboard.html")
        print(f"   • Simple Dashboard: http://localhost:{PORT}/simple-dashboard.html")
        print(f"   • Basic View: http://localhost:{PORT}/index.html")
        print(f"")
        print(f"💡 Tip: Use Ctrl+C to stop the server")
        print(f"")
        
        # Try to open the main dashboard in browser
        try:
            webbrowser.open(f'http://localhost:{PORT}/dashboard.html')
            print(f"🌐 Opened dashboard in your default browser")
        except:
            print(f"⚠️  Could not auto-open browser. Please visit the URL manually.")
        
        print(f"")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n👋 Server stopped")
            sys.exit(0)

if __name__ == "__main__":
    main()
