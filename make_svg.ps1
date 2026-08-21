$bytes = [System.IO.File]::ReadAllBytes("src\app\icon.jpg")
$b64 = [System.Convert]::ToBase64String($bytes)
$svg = "<svg width='1024' height='1024' viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg'><defs><clipPath id='c'><circle cx='512' cy='512' r='512'/></clipPath></defs><image href='data:image/jpeg;base64,$b64' width='1024' height='1024' clip-path='url(#c)'/></svg>"
New-Item -ItemType Directory -Force -Path "public"
Set-Content -Path "public\logo.svg" -Value $svg
