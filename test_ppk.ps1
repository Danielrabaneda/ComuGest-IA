Import-Module Posh-SSH
$ServerIP   = "217.160.224.132"
$User       = "root"
$Password   = "StratoVPS2026Secure"
$KeyPath    = "C:\Users\Hp\Desktop\Private key.ppk"

$SecurePass = ConvertTo-SecureString $Password -AsPlainText -Force
$Credential = New-Object System.Management.Automation.PSCredential($User, $SecurePass)

try {
    Write-Host "Intentando conectar con $KeyPath..."
    $Session = New-SSHSession -ComputerName $ServerIP -Credential $Credential -KeyFile $KeyPath -AcceptKey -Force -ErrorAction Stop
    Write-Host "SUCCESS! Conectado con la llave PPK. Session ID: $($Session.SessionId)"
    Remove-SSHSession -SessionId $Session.SessionId
} catch {
    Write-Error "Fallo con PPK: $($_.Exception.Message)"
}
