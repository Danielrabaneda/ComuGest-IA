with open('/tmp/vnc_page.html', 'r', encoding='utf-8', errors='replace') as f:
    html = f.read()
import re

# Find all getQueryParam calls
params = re.findall(r"getQueryParam\(['\"](\w+)['\"]", html)
print('QueryParams used:', params)

# Find rfb/RFB connect section
for keyword in ['rfb.connect', 'this.rfb', 'serverData', 'ingestToken', 'websock']:
    idx = html.find(keyword)
    if idx >= 0:
        print(f'\n=== Section around "{keyword}" ===')
        print(html[max(0,idx-200):idx+500])
        break
