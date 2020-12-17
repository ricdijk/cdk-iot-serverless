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
# Remarks
## Certificate/Key Creation and Re-use
When creating the stack it will look for CSR (Certificat Creation Request) and Keys in the 'cert' directory. When found, the CSR will be send to AWS to be turned into a Certifica. This will ensure the creation of the same Certificate, so the Key/Certivicate on the IoT device can remain the same. If no CSR/Keys are found, a new CSR will be creaded and stored in the 'cert' directory for future use. This new Certificate/Key needs to be rolled out to the IoT device.

## Certificate/Key rollout to IoT device
After stack createion the following documents should be rolled out to the IoT device:
  * Private key: The PEM file can be found in the 'cert' directory
  * Certificate: The certificate PEM file can be retrieved from AWS with the following command:
  ```
  aws iot describe-certificate --query "certificateDescription.certificatePem" --output text --certificate-id ${CERTIFICATEID}
  ```
Path to Private key, Certificate Id and command to retrieve Certificate PEM file will be output by the 'cdk deploy' command.

## Delete policy
The stack will automaticly delete created S3 objects:
 * Athena object with an S3 policy
 * Ruuvi json object, with a daily scheduled Lambda function  

____
# Installation
## Installation
  * Install  and configure all Prerequisits
  * Configue 'settings.json'
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
 * If 'account' or 'region' are changed, endpoint in ruuvi code needs to be changed
 * If 'prefixed' is changed, ruuvi prefix needs to be changed

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
