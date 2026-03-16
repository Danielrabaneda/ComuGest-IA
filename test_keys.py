import paramiko
import os

host = "217.160.224.132"
user = "root"
ppk_path = r"C:\Users\Hp\Desktop\Private key.ppk"

print(f"[*] Intentando conectar a {host} con {ppk_path}...")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    # Paramiko doesn't support PPK natively in all versions, 
    # but let's try assuming it might be an OpenSSH key disguised or use the right method
    client.connect(host, username=user, key_filename=ppk_path, timeout=15)
    print("[OK] CONECTADO con la llave PPK!")
    stdin, stdout, stderr = client.exec_command("whoami && uptime")
    print(f"[*] Output: {stdout.read().decode()}")
    client.close()
except Exception as e:
    print(f"[!] Error con PPK: {e}")
    
    print("[*] Intentando con id_rsa...")
    id_rsa_path = os.path.expanduser(r"~/.ssh/id_rsa")
    try:
        client.connect(host, username=user, key_filename=id_rsa_path, timeout=15)
        print("[OK] CONECTADO con id_rsa!")
        client.close()
    except Exception as e2:
        print(f"[!] Error con id_rsa: {e2}")
