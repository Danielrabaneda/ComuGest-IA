import paramiko
import sys
import time

host = "217.160.224.132"
user = "root"
password = "StratoVPS2026Secure"

print(f"[*] Intentando conectar a {host} con usuario {user}...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

# Handler para keyboard-interactive
def interactive_handler(title, instructions, prompt_list):
    print(f"[*] Keyboard-interactive prompt: {prompt_list}")
    answers = []
    for prompt, echo in prompt_list:
        if 'password' in prompt.lower() or 'contraseña' in prompt.lower():
            answers.append(password)
        else:
            answers.append(password)
    return answers

try:
    # Try 1: password auth
    print("[*] Metodo 1: password directo...")
    client.connect(host, username=user, password=password, 
                   allow_agent=False, look_for_keys=False,
                   timeout=15, banner_timeout=15)
    print("[OK] Conectado con password!")
except paramiko.AuthenticationException as e:
    print(f"[!] Password auth fallido: {e}")
    try:
        # Try 2: keyboard-interactive
        print("[*] Metodo 2: keyboard-interactive...")
        transport = paramiko.Transport((host, 22))
        transport.connect()
        transport.auth_interactive(user, interactive_handler)
        if transport.is_authenticated():
            print("[OK] Conectado con keyboard-interactive!")
            # Wrap in SSHClient
            client._transport = transport
        else:
            print("[!] keyboard-interactive fallido")
            sys.exit(1)
    except Exception as e2:
        print(f"[!] Todos los metodos fallaron: {e2}")
        # Show what auth methods are available
        try:
            t2 = paramiko.Transport((host, 22))
            t2.connect()
            try:
                t2.auth_none(user)
            except paramiko.BadAuthenticationType as bate:
                print(f"[INFO] Metodos permitidos por el servidor: {bate.allowed_types}")
            t2.close()
        except Exception as e3:
            print(f"[INFO] Error consultando metodos: {e3}")
        sys.exit(1)

# If connected, run commands
try:
    print("[*] Ejecutando comandos de habilitacion SSH...")
    stdin, stdout, stderr = client.exec_command(
        "sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config && "
        "sed -i 's/^#*PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config && "
        "systemctl restart sshd && echo 'SSH_HABILITADO_OK'"
    )
    output = stdout.read().decode()
    error = stderr.read().decode()
    print(f"[*] Output: {output}")
    if error:
        print(f"[*] Stderr: {error}")
    if "SSH_HABILITADO_OK" in output:
        print("[OK] SSH con password habilitado correctamente!")
    else:
        print("[!] Comando ejecutado pero sin confirmacion")
except Exception as e:
    print(f"[!] Error ejecutando comandos: {e}")
finally:
    client.close()
    print("[*] Sesion cerrada.")
