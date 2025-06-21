
import os
import json
import logging
from datetime import datetime
from typing import Optional
import requests

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

class ErrorMonitor:
    """Simple error monitoring and alerting."""
    
    def __init__(self):
        self.webhook_url = os.getenv("ERROR_WEBHOOK_URL")
        self.app_name = "RavenScan API"
    
    def log_error(self, error: Exception, context: dict = None):
        """Log error and send alert."""
        error_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "app": self.app_name,
            "error": str(error),
            "type": type(error).__name__,
            "context": context or {}
        }
        
        # Console logging
        logger.error(f"Error: {error_data}")
        
        # Send webhook alert
        if self.webhook_url:
            try:
                requests.post(
                    self.webhook_url,
                    json={
                        "text": f"🚨 {self.app_name} Error",
                        "blocks": [{
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": f"*Error:* {error}\n*Type:* {type(error).__name__}\n*Time:* {error_data['timestamp']}"
                            }
                        }]
                    },
                    timeout=5
                )
            except Exception as e:
                logger.warning(f"Failed to send webhook alert: {e}")
    
    def log_request(self, endpoint: str, client_ip: str, success: bool = True):
        """Log API request."""
        status = "SUCCESS" if success else "FAILED"
        logger.info(f"API {status}: {endpoint} from {client_ip}")

# Global monitor instance
monitor = ErrorMonitor()
