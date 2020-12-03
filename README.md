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

## Prerequisits
  * AWS Cli installed
  * AWS cdk toolkit installed
  * AWS region bootstrapped for Aws CDK (*cdk bootstrap aws://ACCOUNT-NUMBER-1/REGION-1*)
  * AWS configure for access to Environment

## settings.JSON
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
----------------------------------------------------------------------------------------------------
Deploying IoT Serverless Stack for:

Account:        xxxxxxxxxxxx
Region:         us-east-2
Prefix:         rdicdk
New Bucket:     true
Thing Endpoint: xxxxxxxxxxxxxx-ats.iot.eu-west-1.amazonaws.com
----------------------------------------------------------------------------------------------------
```
The first 4 rows are the parameters read from the config file. The last is the endpoint to be used by the ruuvi software to publish to the iot-core topic.
  ## Overview
  ![Overview](/image/overview.png)

## Known issues
   * Hardcoded Certificate in code
   * Destroy fails with error:
       * *The policy cannot be deleted as the policy is attached to one or more principals (name=rdicdk-policy)*
       * *Cannot delete. Thing rdicdk-ruuvi is still attached to one or more principals*
   * Resolution:
       * Before *'cdk destoy'*
       * Goto AWS '*Concole->Iot-Core->secure->policy*', select '*\<prefix\>policy*' and '*action->deleted*'
       * Goto AWS '*Concole->Iot-Core->secure->thing*', select '*\<prefix\>-thing*' and '*action->deleted*'
       * Goto '*AWD console->S3*', select bucket '*\<prefix\>-bucket*', click '*empty*', type '*permanently delete*' and click '*Empty*'
