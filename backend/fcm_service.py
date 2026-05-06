import firebase_admin
from firebase_admin import credentials, messaging
import os

# Initialize Firebase Admin
cred_path = os.getenv("FIREBASE_CREDENTIALS", "firebase-service-account.json")

try:
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        print(f"Warning: Firebase credentials not found at {cred_path}. Push notifications will not be sent.")
except Exception as e:
    print(f"Firebase initialization error: {e}")

def send_push_notifications(tokens: list[str], title: str, body: str, data: dict = None):
    if not firebase_admin._apps:
        return False
        
    valid_tokens = [t for t in tokens if t]
    if not valid_tokens:
        return False

    message = messaging.MulticastMessage(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data=data or {},
        tokens=valid_tokens,
    )
    
    try:
        response = messaging.send_each_for_multicast(message)
        print(f'{response.success_count} messages were sent successfully')
        return True
    except Exception as e:
        print(f"Error sending FCM message: {e}")
        return False
