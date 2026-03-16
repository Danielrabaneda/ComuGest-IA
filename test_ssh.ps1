Import-Module Posh-SSH
$ServerIP   = "217.160.224.132"
$User       = "root"
$Password   = "StratoVPS2026Secure"
$KeyPath    = "C:\Users\Hp\.ssh\id_rsa"

$SecurePass = ConvertTo-SecureString $Password -AsPlainText -Force
$Credential = New-Object System.Management.Automation.PSCredential($User, $SecurePass)

try {
    $Session = New-SSHSession -ComputerName $ServerIP -Credential $Credential -KeyFile $KeyPath -AcceptKey -Force -ErrorAction Stop
    Write-Host "Success! Session ID: $($Session.SessionId)"
    Remove-SSHSession -SessionId $Session.SessionId
} catch {
    Write-Error "Connection failed: $($_.Exception.Message)"
    if ($_.Exception.InnerException) {
        Write-Error "Inner: $($_.Exception.InnerException.Message)"
    }
}
