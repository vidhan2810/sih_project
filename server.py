#!/usr/bin/env python3
"""
BitAware - Local Development & Demo Server
Run `python server.py` to start local web server and launch browser automatically.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    handler = CustomHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 60)
        print(" BitAware — Civic Issue Reporting & Resolution Platform")
        print(f" Server running at: {url}")
        print(" Press Ctrl+C to stop the server.")
        print("=" * 60)
        
        try:
            webbrowser.open(url)
        except Exception:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
            httpd.shutdown()

if __name__ == '__main__':
    run_server()