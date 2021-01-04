#//--------------------------------------------------------------------------------------------------------------------
#// the program will transfer Roovi data to AWS
#// developped for and tested on Rasberry Pi
#//
#// Note: The program needs environment variable: RUUVI_BLE_ADAPTER="Bleson"
#//
#// Author: Richard van Dijk (richard.vandijk@futurefacts.nl)
#// Date:   nov/Jan 2021
#//--------------------------------------------------------------------------------------------------------------------
#
# Ruuvi sents data every 5-10 seconds. Data will be sent the first time ruuvi sents data after the number of SEC has passed
# the next event is based on the first start time, not on the actual time the data was sent, since this might be later

# import packages
from ruuvitag_sensor.ruuvi import RuuviTagSensor, RunFlag
import datetime
import time
import sys
import json
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

###########################################################################
# Settings for AWS environment
ENDPOINT     = "a12kn3h7do626x-ats.iot.eu-west-1.amazonaws.com"
PREFIX       = 'rdiricdijk'
PATH_TO_CERT = "/home/pi/CDK-ruuvi/ruuvi-certificate.pem.crt"
PATH_TO_KEY  = "/home/pi/CDK-ruuvi/ruuvi-private.pem.key"
PATH_TO_ROOT = "/home/pi/CDK-ruuvi/root-CA.crt"

CLIENT_ID   = PREFIX + "-ruuvi"
TOPIC 		= PREFIX + "/ruuvi"
TOPICRX	    = PREFIX + "/ruuvi-rx"
###########################################################################


###########################################################################
# Parse command line, if not present default
# Loops is number of datapoints that will be sent to AWS
# Sec is the number of seconds between to dataponts
if len(sys.argv) > 1:
	LOOPS=int(sys.argv[1])
else:
	LOOPS=1

if len(sys.argv) > 2:
	SEC=int(sys.argv[2])
else:
	SEC=60


###########################################################################
# Initialize vars

# RunFlag for stopping execution at desired time
run_flag = RunFlag()

# List of macs of sensors which will execute callback function, [] => no filter
macs = []

# count number of data puplications
loop=0

# Global var for last message
rdiLastMessage = ''


# Output data
print('--------------------------------------------------------------------------------')
print('Prefic:   ', PREFIX)
print('ClientId: ', CLIENT_ID)
print('EndPoint: ', ENDPOINT)
print('--------------------------------------------------------------------------------')



###########################################################################
# Handler for RUUVI data
# global vars:
# loop: loop Count
# LOOPS: total number of loops
# SEC: seconds between datapoints
# now: holds current time
# next: next time a datapont will be stat
def handle_data(json_in):
	global loop, LOOPS, SEC, now, next

	#is it time to sent a message?
	if datetime.datetime.now() >= next:
		loop=loop+1
		print()
		print('now : ', datetime.datetime.now().strftime('%H:%M:%S'))

		# set next SEC seconds after last next time (not the actual time, so data will be sent at the same moment)
		next = next + datetime.timedelta(seconds=SEC)

		# prefent strange behaviour on longer timeouts
		if datetime.datetime.now() >= next:
			print('Next time allready passes, resseting next parameter.')
			next = datetime.datetime.now() + datetime.timedelta(seconds=SEC)

		# Add data to ruuvi data and sent message
		json_in[1]['timestamp']=datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
		json_in[1]['timestamp2']=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
		json_in[1]['ts']=time.time()
		json_in[1]['deviceId']=CLIENT_ID
		json_in[1]['lastMessage']=rdiLastMessage
		data=json.dumps(json_in[1])
		print(str(loop) + "/" + str(LOOPS) + ": Published: '" + data + "' to the topic: " + "'" + TOPIC + "'")
		myAWSIoTMQTTClient.publish(TOPIC, data, 1)

		# if #loops reached, exit
		if loop >= LOOPS:
			run_flag.running = False
		print('Next: ', next.strftime('%H:%M:%S'))

	# ouitput point to indicate progress
	else:
		print('.', end='')

	#flush, otherwise we wont see the progress points
	sys.stdout.flush()

# Custom MQTT message callback
def customCallback(client, userdata, message):
    global rdiLastMessage
    print()
    print("------------------------------------------")
    temp = json.loads(message.payload)
    print(temp['message'])
    print("------------------------------------------\n")
    rdiLastMessage = temp['message']




###########################################################################
# Start
###########################################################################

#Print date to stdio (can be rerouted to logfile(
now = datetime.datetime.now()
print()
print (now.strftime("%Y-%m-%d %H:%M:%S"), ' Start publishing Ruuvi Data to AWS IoT.')
print("Aantal loops: " + str(LOOPS) + ", interval: " + str(SEC) + "s")




############################################################################
# Create connection to AWS
# Init AWSIoTMQTTClient
myAWSIoTMQTTClient = AWSIoTMQTTClient(CLIENT_ID)
myAWSIoTMQTTClient.configureEndpoint(ENDPOINT, 443)
myAWSIoTMQTTClient.configureCredentials(PATH_TO_ROOT, PATH_TO_KEY, PATH_TO_CERT)

# AWSIoTMQTTClient connection configuration
myAWSIoTMQTTClient.configureAutoReconnectBackoffTime(1, 32, 20   # baseReconnectQuietTimeSecond, maxReconnectQuietTimeSecond, stableConnectionTimeSecond
myAWSIoTMQTTClient.configureOfflinePublishQueueing(-1)           # Infinite offline Publish queueing
myAWSIoTMQTTClient.configureDrainingFrequency(2)                 # Draining: 2 Hz
myAWSIoTMQTTClient.configureConnectDisconnectTimeout(10)         # 10 sec
myAWSIoTMQTTClient.configureMQTTOperationTimeout(5)              # 5 sec

# Connect and subscribe to AWS IoT
myAWSIoTMQTTClient.connect()
myAWSIoTMQTTClient.subscribe(TOPICRX, 1, customCallback)

print(" => Connected!\n")

###########################################################################
# Start listening to Ruuvy, handler will me called whenever data is received
now  = datetime.datetime.now()
next = now
RuuviTagSensor.get_datas(handle_data, macs, run_flag)

###########################################################################
# Close resources and exit
now = datetime.datetime.now()
print()
print (now.strftime("%Y-%m-%d %H:%M:%S") + ' End of program')
