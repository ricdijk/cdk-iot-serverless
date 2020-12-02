// Environment
const settings = require('../settings.json') ;
const accountID          = settings.accountId;
const regionName         = settings.regionName;
const preFix             = settings.prefix;

//global vars
var thingId            = preFix + '-ruuvi'
var bucketName         = preFix + '-bucket'
var policyName         = preFix + '-policy'
var databaseName       = preFix + '-database'
var tableName          = 'generic'
var firehoseName       = preFix + 'FirehoseRole'
var streamName         = preFix + 'DeliveryStreamRuuviS3'
var topicRuleName      = preFix + 'rule'
var topicRuleRoleName  = preFix + 'TopicRuleRole'
var deleveryStreamName = preFix + 'DeliveryStreamRuuviS3'
var websiteHandlerName = preFix + '-websiteHandler'
var arnEnv             = regionName + ":" + accountID;

//imports
import * as cdk      from '@aws-cdk/core';
import * as lambda   from '@aws-cdk/aws-lambda';
import * as s3       from '@aws-cdk/aws-s3';
import * as apigw    from '@aws-cdk/aws-apigateway';
import * as glue     from '@aws-cdk/aws-glue';
import * as iot      from '@aws-cdk/aws-iot';
import * as iam      from '@aws-cdk/aws-iam';
import * as firehose from '@aws-cdk/aws-kinesisfirehose';
import { PolicyStatement } from "@aws-cdk/aws-iam";

//stack
export class CdkStack extends cdk.Stack {
  public readonly rdiWebsiteEndpoint: cdk.CfnOutput;


  //constructor
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

//-------------- Basics ---------------
    // S3 bucket
    const rdiBucket = new s3.Bucket(this, preFix+'Bucket', {
    versioned: true,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    bucketName:  bucketName
	});


//-------------- Thing ---------------
	//IotCore - thing
	const rdiThing = new iot.CfnThing(this, preFix+'thing', {
		thingName:			thingId,
		attributePayload:	{}
	});


	// Thing Policy
	const rdiPolicy = new iot.CfnPolicy(this, preFix+'cfnPolicy', {
		policyName: 	policyName,
		policyDocument:
		// =========== Start Policy ***************/
			{
			  "Version": "2012-10-17",
			  "Statement": [
				{
				  "Effect": "Allow",
				  "Action": [
					"iot:Publish",
					"iot:Receive"
				  ],
				  "Resource": [
					"arn:aws:iot:"+arnEnv+":topic/" + preFix + "*"
				  ]
				},
				{
				  "Effect": "Allow",
				  "Action": [
					"iot:Subscribe"
				  ],
				  "Resource": [
					"arn:aws:iot:" + arnEnv + ":topicfilter/" + preFix + "*"
				  ]
				},
				{
				  "Effect": "Allow",
				  "Action": [
					"iot:Connect"
				  ],
				  "Resource": [
					"arn:aws:iot:" + arnEnv + ":client/"+ thingId,
				  ]
				}
			  ]
			}
		// =========== End Policy ***************/
	});

	const rdiCerificate = new iot.CfnCertificate(this, preFix+'Certificate', {
		status:						'ACTIVE',
		certificateMode:			'SNI_ONLY',
		certificatePem:				`-----BEGIN CERTIFICATE-----
MIIDWTCCAkGgAwIBAgIUXXEr5cx7TsKmsblm6sZFoDpCwakwDQYJKoZIhvcNAQEL
BQAwTTFLMEkGA1UECwxCQW1hem9uIFdlYiBTZXJ2aWNlcyBPPUFtYXpvbi5jb20g
SW5jLiBMPVNlYXR0bGUgU1Q9V2FzaGluZ3RvbiBDPVVTMB4XDTIwMTEyNTEyNDAx
NFoXDTQ5MTIzMTIzNTk1OVowHjEcMBoGA1UEAwwTQVdTIElvVCBDZXJ0aWZpY2F0
ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMFpG5kiZpPONEuePxR/
h4rG6nbCGFVU8XBs0BrkrjiA2DXOdwm8O/3ZL4gcD0XU+kcqznOP85r9+/F9cG/2
KWmtFzx/v7e2AhW0BaYVX31X40KS+T/l9dUPN62Vxryt/N+45eAplK3k4wi+IVEm
LcAtgwHxDnruHacyzC8QCcrefidJRIz9/4kr5PCC8PQKYWjErxzg77UTNPffyocz
9tH7DY8anQ3DT5JOll3DnqaTZelHFtWukFD6NoAM/FD/fO/vzBPvkFJMwMh6nlB0
Qm1103TJKh1TSXpf/IfxX3E8xRXuq0yetfJLHeNXZqHe+ElfCYfbEE2UzEQbjhtS
mp0CAwEAAaNgMF4wHwYDVR0jBBgwFoAUxbe/4eq2LAllh9kvA9ZiwcXdeK4wHQYD
VR0OBBYEFNG6SmyFV1fY4boV4kx+gwNDjlclMAwGA1UdEwEB/wQCMAAwDgYDVR0P
AQH/BAQDAgeAMA0GCSqGSIb3DQEBCwUAA4IBAQAUMq9N93L+tYJeBbkFwS6GXLOX
6dBlEcmMJdCI7Oyde/+yNGAbdDPc4/IX6efyRyRtc/4DLgpGUUBbdWqqWzihdWPC
IteW/kutnRj1baJnK7lroHyq034ukgcSalFyvU7oNihnYk7TVrtkeFBLY9pAGswl
DBzPMyTZ+Skp4XvlG1BPbqvUl3P+JW5KVhDbndJcHKMf6mai4+bxRqcCGRZDwJ6Y
zYkPCqFyERLQBwkE+im8CagboV25TvtBX2l2IPbO5Jo2vNy2pY7i3mR+9/9NZLw+
K1HGTnLhK7PgwFLN8oEH00u3mEk4qsSy6jsk3cnUugCz1jKfmGoeogQwMGA5
-----END CERTIFICATE-----`
	});


	// bind principle to policy
	new iot.CfnPolicyPrincipalAttachment(this, preFix+'policyPrincipleAttachment', {
		policyName: 	policyName,
		principal:		rdiCerificate.attrArn
	});
	// bind principle to thing
	new iot.CfnThingPrincipalAttachment(this, preFix+'ThingPrincipalAttachment', {
		thingName: 		thingId,
		principal:		rdiCerificate.attrArn
	});

//-------------- Topic - FireHose - S3 ---------------
	const rdiFirehoseRole = new iam.Role(this, preFix+'FirehoseRole', {
		assumedBy:		new iam.ServicePrincipal('firehose.amazonaws.com'),
		roleName:		firehoseName,
	});
	rdiFirehoseRole.addToPolicy(new PolicyStatement({
        actions: [
            "glue:GetTable",
            "glue:GetTableVersion",
            "glue:GetTableVersions"
        ],
        resources: [
            "arn:aws:glue:" + arnEnv + ":catalog",
            "arn:aws:glue:" + arnEnv + ":database/%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%",
            "arn:aws:glue:" + arnEnv + ":table/%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%/%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%"
        ]
    }));
    rdiFirehoseRole.addToPolicy(new PolicyStatement({
        actions: [
            "s3:AbortMultipartUpload",
            "s3:GetBucketLocation",
            "s3:GetObject",
            "s3:ListBucket",
            "s3:ListBucketMultipartUploads",
            "s3:PutObject"
        ],
        resources: [
	        rdiBucket.bucketArn,
	        rdiBucket.bucketArn+"*"
        ]
    }));
    rdiFirehoseRole.addToPolicy(new PolicyStatement({
        actions: [
            "lambda:InvokeFunction",
            "lambda:GetFunctionConfiguration"
        ],
        resources: [
           "arn:aws:lambda:" + arnEnv + ":function:%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%"
	    ]
	}));
	rdiFirehoseRole.addToPolicy(new PolicyStatement({
        actions: [
	        "kms:GenerateDataKey",
            "kms:Decrypt"
        ],
        resources: [
            "arn:aws:kms:" + arnEnv + ":key/%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%"
        ],
       conditions: {
            StringEquals: { "kms:ViaService": "s3." + regionName + ".amazonaws.com" },
            StringLike:   { "kms:EncryptionContext:aws:s3:arn":  "arn:aws:s3:::%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%/*" }
        }
	}));
	rdiFirehoseRole.addToPolicy(new PolicyStatement({
        actions: [
        	"logs:PutLogEvents"
        ],
        resources: [
	        "arn:aws:logs:" + arnEnv + ":log-group:/aws/kinesisfirehose/rdi-GenericS3Stream:log-stream:*"
        ]
	}));
	rdiFirehoseRole.addToPolicy(new PolicyStatement({
        actions: [
            "kinesis:DescribeStream",
	        "kinesis:GetShardIterator",
            "kinesis:GetRecords",
            "kinesis:ListShards"
        ],
        resources: [
        	"arn:aws:kinesis:" + arnEnv + ":stream/%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%"
        ]
	}));
	rdiFirehoseRole.addToPolicy(new PolicyStatement({
        actions: [
            "kms:Decrypt"
        ],
        resources: [
        	 "arn:aws:kms:" + arnEnv + ":key/%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%"
        ],
       conditions: {
	        StringEquals: {"kms:viaService":          "kinesis." + regionName + ".amazonaws.com" },
            StringLike:   {"kms:EncryptionContext:aws:kinesis:arn": "arn:aws:kinesis:" + arnEnv + ":stream/%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%" }
        }
	}));

// ================ End STatement =================

	var rdiFirehose = new firehose.CfnDeliveryStream(this, preFix+'DeliveryStream', {
		deliveryStreamName:		streamName,
		deliveryStreamType:		'DirectPut',
		s3DestinationConfiguration: {
			bucketArn:			rdiBucket.bucketArn,
			roleArn:			rdiFirehoseRole.roleArn,
			bufferingHints: 	{intervalInSeconds:300},
			errorOutputPrefix:	'error',
			prefix:				preFix

		}
	});
	const rdiTopicRuleRole = new iam.Role(this, preFix+'TopicRuleRole', {
		assumedBy:		new iam.ServicePrincipal('iot.amazonaws.com'),
		roleName:		topicRuleRoleName,
	});
	rdiTopicRuleRole.addToPolicy(new PolicyStatement({
      resources: [rdiFirehose.attrArn],
      actions: ['firehose:PutRecord'],
    }));

	new iot.CfnTopicRule(this, preFix+'TopicRule', {
		ruleName: 		topicRuleName,
		topicRulePayload:
		{
			ruleDisabled:		false,
			sql:				"select * from '" + preFix + "/ruuvi'",
			actions:
			[{
				firehose:
				{
					deliveryStreamName:		deleveryStreamName,
					roleArn:				rdiTopicRuleRole.roleArn,
					separator:				'\n'
				}
			}]
		}
	});




//-------------- Website ---------------
	// create Athena Database and Table
 	const rdiGlueDatabase = new glue.Database(this, preFix+'IoTDatabase', {
            databaseName: databaseName
    });


	const athenaTable = new glue.Table(this, preFix+'IoTDatabaseTable', {
			database:	rdiGlueDatabase,
		    tableName: 	tableName,
			bucket: 	rdiBucket,
 		    columns:
 		    [
        		{ name: 'humidity',         			type: glue.Schema.DOUBLE },
        		{ name: 'temperature',     				type: glue.Schema.DOUBLE },
        		{ name: 'pressure',       				type: glue.Schema.DOUBLE },
        		{ name: 'acceleration',    				type: glue.Schema.DOUBLE },
        		{ name: 'acceleration_x',   			type: glue.Schema.DOUBLE },
        		{ name: 'acceleration_y',   			type: glue.Schema.DOUBLE },
        		{ name: 'acceleration_z',   			type: glue.Schema.DOUBLE },
        		{ name: 'tx_power', 	    			type: glue.Schema.DOUBLE },
        		{ name: 'movement_counter', 			type: glue.Schema.DOUBLE },
        		{ name: 'measurement_sequence_number', 	type: glue.Schema.DOUBLE },
        		{ name: 'mac',              			type: glue.Schema.STRING },
       			{ name: 'timestamp2',       			type: glue.Schema.TIMESTAMP }
      		],
      		dataFormat: glue.DataFormat.JSON,
      		compressed: false,
      		description: 'Generic IoT data',
      		partitionKeys: [],
      		s3Prefix: ''

    });

    //Lambda for website//Lambda for website
	//permissions on S3 (via Athena)
	const lambdaPolicyS3 = new PolicyStatement()
    lambdaPolicyS3.addActions("s3:GetBucketLocation")
    lambdaPolicyS3.addActions("s3:GetObject")
    lambdaPolicyS3.addActions("s3:ListBucket")
    lambdaPolicyS3.addActions("s3:ListBucketMultipartUploads")
    lambdaPolicyS3.addActions("s3:ListMultipartUploadParts")
    lambdaPolicyS3.addActions("s3:AbortMultipartUpload")
    lambdaPolicyS3.addActions("s3:PutObject")
    lambdaPolicyS3.addResources(rdiBucket.bucketArn)
    lambdaPolicyS3.addResources(rdiBucket.bucketArn+"*")
    lambdaPolicyS3.addResources("arn:aws:s3:::athena-express-*")   //should be a

	const lambdaPolicyAthena = new PolicyStatement()
    lambdaPolicyAthena.addActions("athena:StartQueryExecution")
    lambdaPolicyAthena.addActions("athena:GetQueryExecution")
    lambdaPolicyAthena.addActions("athena:GetQueryResults")
    lambdaPolicyAthena.addActions("glue:GetTable")
    lambdaPolicyAthena.addActions("glue:GetTableVersions")
    lambdaPolicyAthena.addActions("glue:GetTableVersion")
    lambdaPolicyAthena.addActions("glue:GetPartitions")
    lambdaPolicyAthena.addActions("glue:GetDatabases")
    lambdaPolicyAthena.addActions("glue:GetPartition")
    lambdaPolicyAthena.addActions("glue:GetDatabase")
    lambdaPolicyAthena.addActions("glue:GetTable")
    lambdaPolicyAthena.addResources("*")


    //Lambda
    const rvdWebsite = new lambda.Function(this, preFix+'WebsiteHandler', {
      runtime: 			lambda.Runtime.NODEJS_12_X,    // execution environment
      code: 			lambda.Code.fromAsset('lambda'),  // code loaded from "lambda" directory
      handler: 			'rdiWebsite.website_handler',   // file, function
      functionName:		websiteHandlerName,
      timeout:			cdk.Duration.seconds(30),
      initialPolicy: 	[lambdaPolicyS3, lambdaPolicyAthena ],
      environment: {
      	databaseName: 	databaseName,
      	tableName: 		  tableName,
        bucketName:     bucketName
      }
    });


    // defines an API Gateway REST API resource backed for website
    const rdiGateway = new apigw.LambdaRestApi(this, 'Endpoint', {
        handler: rvdWebsite
    });

// -------------- Display Thing Endpoint ------------
   //store endpoint
    this.rdiWebsiteEndpoint = new cdk.CfnOutput(this, 'GatewayUrl', {
      value: rdiGateway.url
    });

// Thing Url only via cli command. Is Async, cant/dont know how to put it in stack output
var exec = require('child_process').exec, child;
exec('aws iot describe-endpoint --output text --endpoint-type iot:Data-ATS',
    function (error:any, stdout:any, stderr:any) {
        console.log('----------------------------------------------------------------------------------------------------');
        console.log('Deploying IoT Serverless Stack for:');
        console.log('');
        console.log('Account:        ' + settings.accountId);
        console.log('Region:         ' + settings.regionName);
        console.log('Prefix:         ' + settings.prefix);
        console.log('Thing Endpoint: ' + stdout);
        console.log('----------------------------------------------------------------------------------------------------');
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    });


//-------------- The End---------------
  }
}
