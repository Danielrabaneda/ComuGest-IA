import paramiko
import os

host = "217.160.224.132"
user = "root"
keys = [
    r"C:\Users\Hp\.ssh\id_rsa",
    r"C:\Users\Hp\Desktop\Private key.ppk"
]

print(f"[*] Escaneando llaves para {host}...")

for k_path in keys:
    if not os.path.exists(k_path):
        print(f"[-] No existe: {k_path}")
        continue
    
    print(f"[*] Probando llave: {k_path}")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        if k_path.endswith('.ppk'):
            # Paramiko usually handles PPK if putty is not needed but let's see
            client.connect(host, username=user, key_filename=k_path, timeout=10)
        else:
            client.connect(host, username=user, key_filename=k_path, timeout=10)
        print("[OK] CONEXIÓN EXITOSA!")
        client.close()
        exit(0)
    except Exception as e:
        print(f"[!] Error: {e}")

print("[FAIL] Ninguna llave funcionó.")
