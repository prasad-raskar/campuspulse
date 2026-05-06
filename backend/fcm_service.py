import os

# Try to import firebase_admin, but don't fail if it's not installed
try:
    import firebase_admin
    from firebase_admin import credentials, messaging
    
    cred_path = os.getenv("FIREBASE_CREDENTIALS", "firebase-service-account.json")
    
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        print(f"Warning: Firebase credentials not found at {cred_path}. Push notifications will not be sent.")
except ImportError:
    print("firebase_admin not installed. Push notifications disabled.")
    firebase_admin = None
except Exception as e:
    print(f"Firebase initialization error: {e}")

def send_push_notifications(tokens: list, title: str, body: str, data: dict = None):
    if firebase_admin is None or not firebase_admin._apps:
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
