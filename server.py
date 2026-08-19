#!/usr/bin/env python3
"""
Simple HTTP server for local testing
Usage: python server.py
Then open: http://localhost:8000
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"""
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🔧 HAKIEEM MOBILE REPAIR SERVICE - Local Server        ║
║                                                           ║
║   Server running at: http://localhost:{PORT}                ║
║                                                           ║
║   Press Ctrl+C to stop the server                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
        """)
        
        # Auto-open browser
        webbrowser.open(f'http://localhost:{PORT}')
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped. Goodbye!")
            httpd.shutdown()

if __name__ == "__main__":
    run_server()
