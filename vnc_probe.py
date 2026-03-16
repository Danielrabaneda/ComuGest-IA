"""
Intento conectar al websockify/noVNC de Strato para obtener la URL WebSocket real
"""
import urllib.request
import json
import re

# El token JWT para la consola VNC
TOKEN = "eyJ0eXAiOiJKV1QiLCJraWQiOiI0MWM1MDFlNC03NGY3LTQwYjctYmMxMi1lZWIzMTAzNThlZDkiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJpb25vc2Nsb3VkIiwiaWF0IjoxNzczMjMxNTQxLCJzZXJ2ZXIiOnsidXVpZCI6IjM0ZDRlODYyLTY0YzAtNDgwYy1hZjQ5LTY2ZTUxZmY0Y2MwMSIsIm5hbWUiOiJkZGMzYzg3Zi0xOWU0LTQzYzItYjBlNy03ZWMzMGZhYmZlYzMifX0.WMFemvnRrNPJKRBESVZRvzTwvFbv8_WuFoOxPG-bbpXPMosxb4DbPYa2sBo7hhvltjwJ5V_FjFkvLCaji6q-3v6s-g_nIxnCoXaXOqDfRAIVZhFV5MCwBoPkwdHKO0gPvIiwo4aotGFl4HV2UkMGDOzEowq5TI-5rXyXwvW5g710iU_Jtchxi1MhdEl_v9JoOB9jZXBhunx9MRyOXcs_rLLNi6wWvsvnwl6rwxLpT_z-FY-V0SMk0mB00RQyE-SxM846xuWJVXd5ga-LoicxREOhqe8cX-8rO_I7Wlq2TKH1V6pmeshzbnroeiCiRJcBwSsecdrmguWG8sLjqEMN5A"

BASE_URL = "https://vnc-console.strato.de"

print("[*] Descargando pagina noVNC...")
url = f"{BASE_URL}/console/client/vnc/?token={TOKEN}"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode('utf-8', errors='replace')
        print(f"[OK] Pagina descargada ({len(html)} bytes)")
        
        # Buscar URL WebSocket en el HTML o JS
        ws_patterns = [
            r'ws[s]?://[^\'"]+',
            r'websockify[^\'"]*',
            r'host["\s]*:["\s]*["\']([^"\']+)',
            r'port["\s]*:["\s]*(\d+)',
            r'path["\s]*:["\s]*["\']([^"\']+)',
        ]
        
        for pat in ws_patterns:
            matches = re.findall(pat, html)
            if matches:
                print(f"[*] Patron '{pat[:30]}...' encontrado: {matches[:3]}")
        
        # Buscar scripts JS cargados
        scripts = re.findall(r'src=["\']([^"\']+\.js[^"\']*)["\']', html)
        print(f"[*] Scripts JS: {scripts[:5]}")
        
        # Guardar el HTML para inspeccionar
        with open('/tmp/vnc_page.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print("[*] HTML guardado en /tmp/vnc_page.html")
        
        # Buscar configuracion inline
        config_match = re.search(r'var\s+\w*[Cc]onfig\s*=\s*(\{[^}]+\})', html)
        if config_match:
            print(f"[*] Config encontrada: {config_match.group(1)[:200]}")
            
except Exception as e:
    print(f"[!] Error: {e}")

# Intentar websockify directamente
print("\n[*] Intentando websockify directo...")
ws_urls = [
    f"{BASE_URL}/console/websockify?token={TOKEN}",
    f"{BASE_URL}/websockify?token={TOKEN}",
    f"{BASE_URL}/console/vnc?token={TOKEN}",
]
for ws_url in ws_urls:
    try:
        req2 = urllib.request.Request(ws_url, headers={
            'User-Agent': 'Mozilla/5.0',
            'Upgrade': 'websocket',
            'Connection': 'Upgrade'
        })
        with urllib.request.urlopen(req2, timeout=5) as resp2:
            print(f"[OK] Respuesta en {ws_url}: {resp2.status}")
    except urllib.error.HTTPError as he:
        print(f"[*] {ws_url.split('/console/')[1][:30]}: HTTP {he.code}")
    except Exception as e:
        print(f"[*] {ws_url.split('/')[-1][:30]}: {type(e).__name__}")
