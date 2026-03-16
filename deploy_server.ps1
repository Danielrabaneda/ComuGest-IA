Import-Module Posh-SSH

$ServerIP   = "217.160.224.132"
$User       = "root"
$Password   = "StratoVPS2026Secure"
$RemoteDir  = "/opt/comugest-ia"
$LocalDir   = "c:\Proyectos\comugest-ia"

$SecurePass = ConvertTo-SecureString $Password -AsPlainText -Force
$Credential = New-Object System.Management.Automation.PSCredential($User, $SecurePass)

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  ComuGest IA - Despliegue al SVP" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# ---- 1. Conectar al servidor ----
Write-Host "[1/7] Conectando a $ServerIP (usando llave SSH)..." -ForegroundColor Yellow
try {
    $KeyPath = "C:\Users\Hp\.ssh\id_rsa"
    $Session = New-SSHSession -ComputerName $ServerIP -Credential $Credential -KeyFile $KeyPath -AcceptKey -Force -ErrorAction Stop
    Write-Host "      Conexion SSH establecida." -ForegroundColor Green
} catch {
    Write-Host "ERROR al conectar: $_" -ForegroundColor Red
    exit 1
}

function Run($cmd) {
    $result = Invoke-SSHCommand -SessionId $Session.SessionId -Command $cmd -TimeOut 300
    return $result
}

# ---- 2. Comprobar/Instalar Docker ----
Write-Host "`n[2/7] Comprobando Docker en el servidor..." -ForegroundColor Yellow
$dockerCheck = Run "docker --version 2>/dev/null || echo 'NOT_INSTALLED'"
if ($dockerCheck.Output -like "*NOT_INSTALLED*") {
    Write-Host "      Instalando Docker..." -ForegroundColor Yellow
    Run "apt-get update -qq"
    Run "apt-get install -y -qq ca-certificates curl gnupg"
    Run "install -m 0755 -d /etc/apt/keyrings"
    Run "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg"
    Run "chmod a+r /etc/apt/keyrings/docker.gpg"
    Run 'echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list'
    Run "apt-get update -qq"
    Run "apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin"
    Write-Host "      Docker instalado." -ForegroundColor Green
} else {
    Write-Host "      Docker ya esta instalado: $($dockerCheck.Output)" -ForegroundColor Green
}

# ---- 3. Preparar directorio remoto ----
Write-Host "`n[3/7] Preparando directorio remoto $RemoteDir..." -ForegroundColor Yellow
Run "mkdir -p $RemoteDir"
Write-Host "      Directorio listo." -ForegroundColor Green

# ---- 4. Crear sesion SFTP y subir archivos ----
Write-Host "`n[4/7] Subiendo archivos al servidor..." -ForegroundColor Yellow
$SftpSession = New-SFTPSession -ComputerName $ServerIP -Credential $Credential -KeyFile "C:\Users\Hp\.ssh\id_rsa" -AcceptKey -Force

# Archivos y carpetas a subir
$FilesToUpload = @(
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "tsconfig.json",
    "postcss.config.mjs",
    "eslint.config.mjs",
    "Dockerfile",
    "docker-compose.yml",
    ".dockerignore",
    "proxy.ts"
)
$FoldersToUpload = @("app", "components", "lib", "public", "types", "supabase")

# Subir archivos individuales
foreach ($file in $FilesToUpload) {
    $localPath = Join-Path $LocalDir $file
    if (Test-Path $localPath) {
        Write-Host "      Subiendo $file..." -ForegroundColor DarkGray
        Set-SFTPItem -SessionId $SftpSession.SessionId -Path $localPath -Destination $RemoteDir -Force 2>/dev/null
    }
}

# Subir carpetas via tar+sftp (más eficiente)
Write-Host "      Creando archivo de codigo fuente..." -ForegroundColor DarkGray
$tarPath = "$env:TEMP\comugest_src.tar.gz"
$tarFolders = $FoldersToUpload | ForEach-Object { $_ }
Push-Location $LocalDir
# Compress via powershell-native
$items = $FoldersToUpload | ForEach-Object { Join-Path $LocalDir $_ } | Where-Object { Test-Path $_ }
& tar -czf $tarPath -C $LocalDir ($FoldersToUpload | Where-Object { Test-Path (Join-Path $LocalDir $_) })
Pop-Location

Write-Host "      Subiendo codigo fuente (tar.gz)..." -ForegroundColor DarkGray
Set-SFTPItem -SessionId $SftpSession.SessionId -Path $tarPath -Destination $RemoteDir -Force
Write-Host "      Extrayendo en el servidor..." -ForegroundColor DarkGray
Run "cd $RemoteDir && tar -xzf comugest_src.tar.gz && rm comugest_src.tar.gz"

Remove-SFTPSession -SessionId $SftpSession.SessionId | Out-Null
Write-Host "      Codigo fuente subido correctamente." -ForegroundColor Green

# ---- 5. Crear .env.production en el servidor ----
Write-Host "`n[5/7] Configurando variables de entorno..." -ForegroundColor Yellow
$envContent = @"
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
OPENROUTER_MODEL=openrouter/auto
NEXT_PUBLIC_APP_URL=https://comugest-IA.com
GROQ_API_KEY=YOUR_GROQ_API_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
NODE_ENV=production
PORT=3000
"@
# Escapar el contenido para heredoc
$envEscaped = $envContent -replace '"', '\"'
Run "cat > $RemoteDir/.env.production << 'ENVEOF'`n$envContent`nENVEOF"
Write-Host "      Variables de entorno configuradas." -ForegroundColor Green

# ---- 6. Actualizar docker-compose para usar .env.production ----
Write-Host "`n[6/7] Construyendo imagen Docker y levantando contenedor..." -ForegroundColor Yellow
$dockerCompose = @"
version: '3.8'
services:
  comugest-ia:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    environment:
      - NODE_ENV=production
    restart: always
"@
Run "cat > $RemoteDir/docker-compose.yml << 'DCEOF'`n$dockerCompose`nDCEOF"

# Detener contenedor existente si hay
Run "cd $RemoteDir && docker compose down 2>/dev/null || true"

# Build y arrancar
Write-Host "      Ejecutando docker compose build (puede tardar 3-5 min)..." -ForegroundColor Yellow
$buildResult = Run "cd $RemoteDir && docker compose build --no-cache 2>&1"
Write-Host $buildResult.Output -ForegroundColor DarkGray

Write-Host "      Levantando contenedor..." -ForegroundColor Yellow
$upResult = Run "cd $RemoteDir && docker compose up -d 2>&1"
Write-Host $upResult.Output -ForegroundColor DarkGray

# ---- 7. Instalar y configurar Nginx con SSL ----
Write-Host "`n[7/7] Configurando Nginx como reverse proxy con HTTPS..." -ForegroundColor Yellow
Run "apt-get install -y -qq nginx certbot python3-certbot-nginx"

$nginxConfig = @"
server {
    listen 80;
    listen [::]:80;
    server_name comugest-IA.com www.comugest-IA.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
"@
Run "cat > /etc/nginx/sites-available/comugest << 'NGEOF'`n$nginxConfig`nNGEOF"
Run "ln -sf /etc/nginx/sites-available/comugest /etc/nginx/sites-enabled/comugest"
Run "rm -f /etc/nginx/sites-enabled/default"
Run "nginx -t && systemctl reload nginx"
Write-Host "      Nginx configurado." -ForegroundColor Green

# SSL con Let's Encrypt
Write-Host "      Obteniendo certificado SSL (Let's Encrypt)..." -ForegroundColor Yellow
$sslResult = Run "certbot --nginx -d comugest-IA.com -d www.comugest-IA.com --non-interactive --agree-tos --email admin@comugest-IA.com --redirect 2>&1"
Write-Host $sslResult.Output -ForegroundColor DarkGray

# Verificar estado final
Write-Host "`n---- Estado final del contenedor ----" -ForegroundColor Cyan
$status = Run "cd $RemoteDir && docker compose ps"
Write-Host $status.Output -ForegroundColor White

# Cerrar sesion
Remove-SSHSession -SessionId $Session.SessionId | Out-Null

Write-Host "`n======================================" -ForegroundColor Green
Write-Host "  DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "  Visita: https://comugest-IA.com" -ForegroundColor Green
Write-Host "======================================`n" -ForegroundColor Green
