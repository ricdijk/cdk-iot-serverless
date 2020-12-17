from ruuvitag_sensor.ruuvi import RuuviTagSensor, RunFlag
import datetime
import time
import sys
import json
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient


###########################################################################
# Parse command linehttps://eu-west-1.console.aws.amazon.com/console/home?nc2=h_ct&src=header-signin&region=eu-west-1
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

#AWS parameters
ENDPOINT     = "a12kn3h7do626x-ats.iot.eu-west-1.amazonaws.com"
PREFIX       = 'rdiricdijk'
PATH_TO_CERT = "/home/pi/CDK-ruuvi/ruuvi-certificate.pem.crt"
PATH_TO_KEY  = "/home/pi/CDK-ruuvi/ruuvi-private.pem.key"
PATH_TO_ROOT = "/home/pi/CDK-ruuvi/root-CA.crt"

CLIENT_ID   = PREFIX + "-ruuvi"
TOPIC 		= PREFIX + "/ruuvi"
TOPICRX	    = PREFIX + "/ruuvi-rx"

rdiLastMessage = ''

print('--------------------------------------------------------------------------------')
print('Prefic:   ', PREFIX)
print('ClientId: ', CLIENT_ID)
print('EndPoint: ', ENDPOINT)
print('--------------------------------------------------------------------------------')
###########################################################################
# Handler for RUUVI data

def handle_data(json_in):
	global loop, LOOPS, SEC, now, next

	if datetime.datetime.now() >= next:
		print()
		loop=loop+1

		print('now : ', datetime.datetime.now().strftime('%H:%M:%S'))


		next = next + datetime.timedelta(seconds=SEC)
		if datetime.datetime.now() >= next:
			print('Next time allready passes, resseting next parameter.')
			next = datetime.datetime.now() + datetime.timedelta(seconds=SEC)

		#print("Next: ", now)
		json_in[1]['timestamp']=datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
		json_in[1]['timestamp2']=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
		json_in[1]['ts']=time.time()
		json_in[1]['deviceId']=CLIENT_ID
		json_in[1]['lastMessage']=rdiLastMessage
		data=json.dumps(json_in[1])
		print(str(loop) + "/" + str(LOOPS) + ": Published: '" + data + "' to the topic: " + "'" + TOPIC + "'")
		myAWSIoTMQTTClient.publish(TOPIC, data, 1)

		if loop >= LOOPS:
			run_flag.running = False
		print('Next: ', next.strftime('%H:%M:%S'))

	else:
		print('.', end='')

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





# Init AWSIoTMQTTClient
myAWSIoTMQTTClient = AWSIoTMQTTClient(CLIENT_ID)
myAWSIoTMQTTClient.configureEndpoint(ENDPOINT, 443)
myAWSIoTMQTTClient.configureCredentials(PATH_TO_ROOT, PATH_TO_KEY, PATH_TO_CERT)

# AWSIoTMQTTClient connection configuration
myAWSIoTMQTTClient.configureAutoReconnectBackoffTime(1, 32, 20)
myAWSIoTMQTTClient.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
myAWSIoTMQTTClient.configureDrainingFrequency(2)  # Draining: 2 Hz
myAWSIoTMQTTClient.configureConnectDisconnectTimeout(10)  # 10 sec
myAWSIoTMQTTClient.configureMQTTOperationTimeout(5)  # 5 sec

# Connect and subscribe to AWS IoT
myAWSIoTMQTTClient.connect()
myAWSIoTMQTTClient.subscribe(TOPICRX, 1, customCallback)

print(" => Connected!\n")

###########################################################################
# STart listening to Ruuvy, handler will me called whenever data is receiver
now = datetime.datetime.now()
next = now
RuuviTagSensor.get_datas(handle_data, macs, run_flag)

###########################################################################
# Close resources and exit
now = datetime.datetime.now()
print()
print (now.strftime("%Y-%m-%d %H:%M:%S") + ' End of program')
