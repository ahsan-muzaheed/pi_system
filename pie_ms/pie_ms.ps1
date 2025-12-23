# Copyright 1998-2018 Epic Games, Inc. All Rights Reserved.

$PublicIp = Invoke-RestMethod http://ipinfo.io/json | Select -exp ip
#$PublicIp = "devstreaming1.eaglepixelstreaming.com"
#$PublicIp = "connector.eaglepixelstreaming.com"

Write-Output "Public IP: $PublicIp"

# $peerConnectionOptions = "{ \""iceServers\"": [{\""urls\"": [\""stun:stun.l.google.com:19302\"",
# \""turn:eu-turn4.xirsys.com:80?transport=udp\"",
# \""turn:eu-turn4.xirsys.com:3478?transport=udp\"",
# \""turn:eu-turn4.xirsys.com:80?transport=tcp\"",
# \""turn:eu-turn4.xirsys.com:3478?transport=tcp\"",
# \""turns:eu-turn4.xirsys.com:443?transport=tcp\"",
# \""turns:eu-turn4.xirsys.com:5349?transport=tcp\""
# ], \""username\"": \""WFQ5P91_DAXmZkETp-dSTpWHmFIuesEQinxe1xFIaP4RqT1D1VEsjWlzUscDJ4fJAAAAAF5-HkpFbHNhTQ==\"",
 # \""credential\"": \""34c2296a-7041-11ea-9023-d68f74b5db2a\""}] }"
 
 
$peerConnectionOptions = "{ \""iceServers\"": [{\""urls\"": [\""stun:" + $PublicIp + ":19302\"",\""turn:" + $PublicIp + ":19303\""], \""username\"": \""PixelStreamingUser\"", \""credential\"": \""Another TURN in the road\""}] }"
 

$ProcessExe = "node.exe"
$Arguments = @("pie_ms", "--peerConnectionOptions=""$peerConnectionOptions""", "--publicIp=$PublicIp")
# Add arguments passed to script to Arguments for executable
$Arguments += $args

Write-Output "Running: $ProcessExe $Arguments"
node pie_ms --peerConnectionOptions=$peerConnectionOptions --publicIp=127.0.0.1
