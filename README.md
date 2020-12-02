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


## Known issues
 * Destroy fails with error:
     * *The policy cannot be deleted as the policy is attached to one or more principals (name=rdicdk-policy)*
     * *Cannot delete. Thing rdicdk-ruuvi is still attached to one or more principals*
 * Resolution:
     * Before *'cdk destoy'*
     * Goto AWS '*Concole->Iot-Core->secure->policy*', select '*\<prefix\>policy*' and '*action->deleted*'
     * Goto '*AWD console->S3*', select bucket '*\<prefix\>-bucket*', click '*empty*', type '*permanently delete*' and click '*Empty*'

## Prerequisits
  * AWS Cli installed
  * AWS cdk toolkit installed
  * AWS region bootstrapped for Aws CDK (*cdk bootstrap aws://ACCOUNT-NUMBER-1/REGION-1*)
  * AWS configure for access to Environment

## output
Installing the stack will add the following output to the cdk output:
```
----------------------------------------------------------------------------------------------------
Deploying IoT Serverless Stack for:

Account:        xxxxxxxxxxxx
Region:         us-east-2
Prefix:         rdicdk
Thing Endpoint: xxxxxxxxxxxxxx-ats.iot.eu-west-1.amazonaws.com
----------------------------------------------------------------------------------------------------
```

The first 3 rows are the parameters read from the config file. The last is the endpoint to be used by the ruuvi software to publish to the iot-core topic.
  ## Overview
  ![Overview](/image/overview.png)
