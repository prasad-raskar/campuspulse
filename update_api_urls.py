import os
import re

directory = '/Users/myaccount/collage app/frontend/src'

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(('.jsx', '.js')) and file != 'config.js':
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            
            if 'window.location.hostname' in content:
                # Determine import path to config.js based on depth
                rel_path = os.path.relpath('/Users/myaccount/collage app/frontend/src/config.js', root)
                if rel_path.startswith('./'):
                    rel_path = rel_path[2:]
                else:
                    rel_path = rel_path.replace('.js', '')
                
                # Check if import already exists
                if 'API_URL' not in content:
                    # Add import at the top
                    import_statement = f"import {{ API_URL }} from '{rel_path}';\n"
                    # insert after last import
                    lines = content.split('\n')
                    last_import_idx = 0
                    for i, line in enumerate(lines):
                        if line.startswith('import '):
                            last_import_idx = i
                    lines.insert(last_import_idx + 1, import_statement)
                    content = '\n'.join(lines)
                
                # Replace exact string `http://${window.location.hostname}:8002` -> `${API_URL}`
                content = content.replace("`http://${window.location.hostname}:8002", "`${API_URL}")
                
                with open(path, 'w') as f:
                    f.write(content)
                print(f"Updated {file}")
