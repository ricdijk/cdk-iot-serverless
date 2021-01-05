# Welcome to the cdk-iot-serverless project!

This project will rollout all resources to load 'ruuvi' data to AWS S3 and adds a serverless webinterface on it.


## Used AWS services

 * Cdk (typescript)
 * Iam
 * S3
 * Iot (iot-core)
 * Kinesis FireHose
 * Glue
 * Athena
 * Lambda (nodejs)
 * Api Gateway
 * Evets & Events-Targets

 ## Overview
 ![Overview](/image/overview.png)

____
# Installation
## Installation
  * Install  and configure all Prerequisits (see below)
  * Get this package from github
  * Configue 'settings.json' (see below)
  * Run'cdk deploy'
  * Deploy 'ruuvi-code', client_id, endpoint, key and certificate to IoT device (information can be found in cdk output)
  * Schedule 'rdi_ruuvi'
  * Retrieve 'CdkIotServerlessStack.<prefix>Endpoit' from cdk output and see graph of database
  * Note: it takes som time for data to be visibale on the graph

## Prerequisits
  * AWS Cli installed
  * AWS cdk toolkit installed
  * AWS region bootstrapped for Aws CDK (*cdk bootstrap aws://ACCOUNT-NUMBER-1/REGION-1*)
  * AWS configure for access to Environment

## settings.json
The following parameters can be set in the file '*settings.json*'
 * accountId - Id own aws account (for use in pollicies)
 * regionName - aws region (e.g. us-east-2)
 * prefix - Prefix to be used on all objects (should be valid aws prefix)
 * newBucket - Use existing bucket of create a new one tru or false

Note:
 * If 'account' or 'region' are changed, endpoint in ruuvi code needs to be changed in 'rdi_ruuvi.py'
 * If 'prefixed' is changed, ruuvi prefix needs to be changed in 'rdi_ruuvi.py'

___
## output
Installing the stack will add the following output to the cdk output:
```
-- Start -------------------------------------------------------------------------------------------
Read CSR/key from Storage.
----------------------------------------------------------------------------------------------------
Info:
Account:        xxxxxxxxxxxx
Region:         eu-west-1
Prefix:         xxx
New Bucket:     true
Thing Endpoint: xxxxxxxxxxxx-ats.iot.eu-west-1.amazonaws.com
==========================================================================================================================================
Key and Certificate for IOT device can be retrieved:
Client id:      xxxxxx
Private key:    cert/xxxxxxxx-ruuvi-private.key
Certificate:    aws iot describe-certificate --query "certificateDescription.certificatePem" --output text --certificate-id $CERTIFICATEID
== End ===================================================================================================================================

...
(cdk output)
...

Outputs:
CdkIotServerlessStack.CERTIFICATEID = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CdkIotServerlessStack.<prefix>Endpointxxxxxxxx = https://xxxxxxxxxx.execute-api.eu-west-1.amazonaws.com/prod/

```
____
# Certificate/Key
## Creation and Re-use
When creating the stack it will look for CSR (Certificat Creation Request) and Keys in the 'cert' directory. When found, the CSR will be send to AWS to be turned into a Certifica. This will ensure the use of the same Certificate after new rollout (e.g. changes), so the Key/Certivicate on the IoT device can remain the same.
If no CSR/Keys are found, a new CSR will be creaded and stored in the 'cert' directory for future use. This new Certificate/Key needs to be rolled out to the IoT device.

## Rollout to IoT device
After stack creation the following documents should be rolled out to the IoT device:
  * Private key: The PEM file can be found in the 'cert' directory
  * Certificate: The certificate PEM file can be retrieved from AWS with the following command:
  ```
  aws iot describe-certificate --query "certificateDescription.certificatePem" --output text --certificate-id ${CERTIFICATEID}
  ```
Path to Private key, Certificate Id and command to retrieve Certificate PEM file will be output by the 'cdk deploy' command.

____
## Ruuvi code and scheduling
### Installation
  * The ruuvi code consists of one python script: 'rdi_ruuvi.py', stored in the 'ruuvi' directory of this repository. Store this file in a appropriate directory on the IoT device.
  * The following fields need to be configured to upload data to AWS:
    * ENDPOINT
    * PREFIX
    * PATH_TO_CERT
    * PATH_TO_KEY
  * The values can be retrieved from the 'cdk deploy' output.
### Prerequisits
  * The 'ruuvitag-sensor' library  is used to read the ruuvi data (https://github.com/ttu/ruuvitag-sensor)
  * For the 'ruuvitag-sensor' library to work the 'Bleso' bluetooth library needs to be installed and pointed to by setting the enviroment variable 'RUUVI_BLE_ADAPTER="Bleson"
  * To connect to AWS the 'aws-iot-device-sdk-python' library needs to be installed

### Running and Scheduling
  * Ruuvi code is started with: 'python3 <path_to>rdi_ruuvi LOOPS=1 SEC=60'
    * LOOPS is the number of requests sent to Aws
    * SEC is the time between two measurement
  * Ruuvi can be schedueled from cron with e.g. the following cron line:
  ```
  0 * * * * export RUUVI_BLE_ADAPTER="Bleson"; python3 /home/pi/CDK-ruuvi/rdi_ruuvi.py 60 60      2>&1 >> /home/pi/<path>/ruuvi.log
  ```
___
# Delete policy
The stack will automaticly delete created S3 objects:
 * Athena objects with an S3 policy
 * Ruuvi json objects, with a daily scheduled Lambda function

___
# Known issue
   * Destroy fails with error:
       * *The policy cannot be deleted as the policy is attached to one or more principals (name=rdicdk-policy)*
       * *Cannot delete. Thing rdicdk-ruuvi is still attached to one or more principals*
   * Resolution:
       * Before *'cdk destoy'*
       * Goto AWS '*Concole->Iot-Core->secure->policy*', select '*\<prefix\>policy*' and '*action->deleted*'
       * Goto AWS '*Concole->Iot-Core->secure->thing*', select '*\<prefix\>-thing*' and '*action->deleted*'
       * Goto '*AWD console->S3*', select bucket '*\<prefix\>-bucket*', click '*empty*', type '*permanently delete*' and click '*Empty*'
