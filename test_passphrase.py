import paramiko
import os

host = "217.160.224.132"
user = "root"
password = "StratoVPS2026Secure"
key_path = os.path.expanduser(r"~/.ssh/id_rsa")

print(f"[*] Intentando conectar a {host} con id_rsa y usando el password como passphrase...")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(host, username=user, password=password, key_filename=key_path, timeout=15)
    print("[OK] CONECTADO!")
    stdin, stdout, stderr = client.exec_command("echo 'Auth Success with Passphrase'")
    print(stdout.read().decode())
    client.close()
except Exception as e:
    print(f"[!] Error: {e}")
