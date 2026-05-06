import os
import re

directory = '/Users/myaccount/collage app/frontend/src'

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            
            # Replace single quotes: 'http://localhost:8002/auth/login' -> `http://${window.location.hostname}:8002/auth/login`
            new_content = re.sub(r"'http://localhost:8002(.*?)'", r"`http://${window.location.hostname}:8002\1`", content)
            
            # Replace template literals: `http://localhost:8002${notice.pdf_url}` -> `http://${window.location.hostname}:8002${notice.pdf_url}`
            new_content = new_content.replace('`http://localhost:8002', '`http://${window.location.hostname}:8002')
            
            if content != new_content:
                with open(path, 'w') as f:
                    f.write(new_content)
                print(f"Updated {file}")
