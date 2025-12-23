import RPi.GPIO as GPIO
import time
import sys

if len(sys.argv) != 2:
    print(" no inpput found. so setting num=26")
    # sys.exit(1)
    num=26
else:    
    num = sys.argv[1]
num = int(num)    
print(f"Hello Number {num}")

test_pin = 19  # GPIO connected to IN2

test_pin = 26 
test_pin = num
RELAY_PIN = test_pin

# Set up GPIO
GPIO.setmode(GPIO.BCM)       # Use BCM numbering (GPIO 14)
GPIO.setup(RELAY_PIN, GPIO.OUT)

# Turn ON the relay (sends LOW signal for active-low relay)
GPIO.output(RELAY_PIN, GPIO.LOW)
print("Relay ON")
time.sleep(.5)  # keep relay on for .5 seconds

# Turn OFF the relay (sends HIGH signal to deactivate)
GPIO.output(RELAY_PIN, GPIO.HIGH)
print("Relay OFF")

# Cleanup GPIO settings
GPIO.cleanup()
