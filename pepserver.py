import SimpleHTTPServer
import SocketServer

class PepHTTPServer(SocketServer.TCPServer):
    handler = None
    port = None
    stopped = False

    def __init__(self, port=8000):
        handler = SimpleHTTPServer.SimpleHTTPRequestHandler
        SocketServer.TCPServer.__init__(self, ("", port), handler)

    def serve_forever(self):
        while not self.stopped:
            self.handle_request()

    def stop(self):
        self.stopped = True
