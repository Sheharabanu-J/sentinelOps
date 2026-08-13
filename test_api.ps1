$body = '{"username":"admin","password":"admin123"}'
$loginResp = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = ($loginResp.Content | ConvertFrom-Json).token
Write-Host "=== LOGIN ===" 
Write-Host "Token received: $($token.Substring(0,40))..."
$h = @{Authorization="Bearer $token"}

Write-Host "`n=== PURCHASES ==="
try { $p = (Invoke-WebRequest -Uri "http://localhost:5000/api/purchases" -Headers $h).Content | ConvertFrom-Json; Write-Host "OK - Count: $($p.Count)" } catch { Write-Host "ERROR: $_" }

Write-Host "`n=== TRANSFERS ==="
try { $t = (Invoke-WebRequest -Uri "http://localhost:5000/api/transfers" -Headers $h).Content | ConvertFrom-Json; Write-Host "OK - Count: $($t.Count)" } catch { Write-Host "ERROR: $_" }

Write-Host "`n=== ASSIGNMENTS ==="
try { $a = (Invoke-WebRequest -Uri "http://localhost:5000/api/assignments" -Headers $h).Content | ConvertFrom-Json; Write-Host "OK - Count: $($a.Count)" } catch { Write-Host "ERROR: $_" }

Write-Host "`n=== EXPENDITURES ==="
try { $e = (Invoke-WebRequest -Uri "http://localhost:5000/api/expenditures" -Headers $h).Content | ConvertFrom-Json; Write-Host "OK - Count: $($e.Count)" } catch { Write-Host "ERROR: $_" }

Write-Host "`n=== ASSETS ==="
try { $assets = (Invoke-WebRequest -Uri "http://localhost:5000/api/assets" -Headers $h).Content | ConvertFrom-Json; Write-Host "OK - Count: $($assets.Count)" } catch { Write-Host "ERROR: $_" }

Write-Host "`n=== METRICS ==="
try { $m = (Invoke-WebRequest -Uri "http://localhost:5000/api/assets/metrics" -Headers $h).Content | ConvertFrom-Json; Write-Host "OK - Closing Balance: $($m.metrics.closingBalance), Purchases: $($m.metrics.purchases)" } catch { Write-Host "ERROR: $_" }

Write-Host "`n=== AUDIT LOGS ==="
try { $al = (Invoke-WebRequest -Uri "http://localhost:5000/api/audit-logs" -Headers $h).Content | ConvertFrom-Json; Write-Host "OK - Count: $($al.Count)" } catch { Write-Host "ERROR: $_" }

Write-Host "`n=== META BASES ==="
try { $b = (Invoke-WebRequest -Uri "http://localhost:5000/api/meta/bases" -Headers $h).Content | ConvertFrom-Json; Write-Host "OK - Bases: $($b | ForEach-Object { $_.name } | Join-String -Separator ', ')" } catch { Write-Host "ERROR: $_" }

Write-Host "`n=== META EQUIPMENT ==="
try { $eq = (Invoke-WebRequest -Uri "http://localhost:5000/api/meta/equipment-types" -Headers $h).Content | ConvertFrom-Json; Write-Host "OK - Types: $($eq | ForEach-Object { $_.name } | Join-String -Separator ', ')" } catch { Write-Host "ERROR: $_" }

# Test POST assignment
Write-Host "`n=== TEST CREATE ASSIGNMENT ==="
try {
    $assignBody = '{"baseId":1,"equipmentTypeId":1,"quantity":2,"personnelName":"Sgt. API Test"}'
    $ar = Invoke-WebRequest -Uri "http://localhost:5000/api/assignments" -Method POST -Body $assignBody -ContentType "application/json" -Headers $h
    Write-Host "OK - $($ar.Content)"
} catch { Write-Host "ERROR: $($_.Exception.Response.StatusCode) - $_" }

# Test POST expenditure
Write-Host "`n=== TEST CREATE EXPENDITURE ==="
try {
    $expBody = '{"baseId":1,"equipmentTypeId":1,"quantity":1,"reason":"API Test"}'
    $er = Invoke-WebRequest -Uri "http://localhost:5000/api/expenditures" -Method POST -Body $expBody -ContentType "application/json" -Headers $h
    Write-Host "OK - $($er.Content)"
} catch { Write-Host "ERROR: $($_.Exception.Response.StatusCode) - $_" }

Write-Host "`n=== ALL DONE ==="
