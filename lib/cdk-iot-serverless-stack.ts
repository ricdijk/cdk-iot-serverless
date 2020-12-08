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

var fileNameCsr = 'cert/' + thingId  + '-csr.csr';
var fileNamePublic = 'cert/' + thingId  + '-public.key';
var fileNamePrivate = 'cert/' + thingId  + '-private.key';


//imports
import * as cdk       from '@aws-cdk/core';
import * as lambda    from '@aws-cdk/aws-lambda';
import * as s3        from '@aws-cdk/aws-s3';
import * as apigw     from '@aws-cdk/aws-apigateway';
import * as glue      from '@aws-cdk/aws-glue';
import * as iot       from '@aws-cdk/aws-iot';
import * as iam       from '@aws-cdk/aws-iam';
import * as firehose  from '@aws-cdk/aws-kinesisfirehose';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import { PolicyStatement } from "@aws-cdk/aws-iam";
import { Construct } from 'constructs';

//stack
export class CdkStack extends cdk.Stack {
  public readonly rdiCertificateId: cdk.CfnOutput;


  //constructor
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

//-------------- Basics ---------------
var rdiBucket;
if (settings.newBucket)
{
    // create S3 bucket
  rdiBucket = new s3.Bucket(this, preFix+'Bucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      bucketName:  bucketName
  });
}
else { //use existing bucet
  rdiBucket = s3.Bucket.fromBucketAttributes(this, preFix+'ImportedBucket', {
      bucketArn: 'arn:aws:s3:::'+bucketName
    });
}


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

//===== Certificate =============================================================================================================
  const fs = require('fs');
  var csr;
  var keyPrivate:string;
  var keyPublic:string;

  if (fs.existsSync(fileNameCsr))
  {
    console.log('Read CSR from Storage.')
    csr        = fs.readFileSync(fileNameCsr).toString();
    keyPrivate = fs.readFileSync(fileNamePrivate).toString() ;
    keyPublic  = fs.readFileSync(fileNamePublic).toString() ;
  }
  else
  {

    console.log('generating key')
    var forge = require('node-forge');
    var pki = forge.pki;

    // generate a keypair or use one you have already
    var keys = pki.rsa.generateKeyPair(2048);
    var csr = forge.pki.createCertificationRequest();
    csr.publicKey = keys.publicKey;
    csr.setSubject([{
      name: 'commonName',
      value: 'AWS IoT Certificate'
    }]);

  // sign certification req uest
    csr.sign(keys.privateKey);
    csr = forge.pki.certificationRequestToPem(csr);
    keyPrivate = pki.privateKeyToPem(keys.privateKey)
    keyPublic  = pki.publicKeyToPem(keys.publicKey)

    fs.writeFile(fileNameCsr, csr,  function(err:any) {
                if (err) {
                    return console.error('Creation of output file failed: '+ err +'\n\nCSR could not be saved');
                }
            });
    fs.writeFile(fileNamePrivate, keyPrivate,  function(err:any) {
                if (err) {
                    return console.error('Creation of output file failed: '+ err +'\n\nPrivate Key could not be saved');
                }
            });
    fs.writeFile(fileNamePublic, keyPublic,  function(err:any) {
                if (err) {
                    return console.error('Creation of output file failed: '+ err +'\n\nPrivate Key could not be saved');
                }
            });

// Certificat manager api of cdk can not be used to store certificates, because of security restriction
// Can bo solved by 'overerving', but cant get taht to work. see below
    //store csr csrin secretmanager
//    var secretString=JSON.stringify({"csr": pem, "Keys": keys})
//    const secret = new secretsmanager.CfnSecret(this, preFix+'Secret', {
//      description:    'CSR PEM for IoTcode',
//      removalPolicy:  cdk.RemovalPolicy.DESTROY,
//      secretName:     preFix + 'CSR',
//    });
//  var secretString=JSON.stringify({"csr": pem, "Keys": keys})
//  const secret = new secretsmanager.Secret(this, preFix + 'Secret');
//  const cfnSecret = secret.construct.defaultChild as secretsmanager.CfnSecret;
//  cfnSecret.generateSecretString = undefined;
//  cfnSecret.secretString = secretString;
}
//==================================================================================================================


//==================================================================================================================
const rdiCerificate = new iot.CfnCertificate(this, preFix+'Certificate', {
  status:						    'ACTIVE',
  certificateMode:			'DEFAULT',
  certificateSigningRequest:				csr
});

//==================================================================================================================


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
      		{ name: 'humidity',         			      type: glue.Schema.DOUBLE },
      		{ name: 'temperature',     				      type: glue.Schema.DOUBLE },
      		{ name: 'pressure',       				      type: glue.Schema.DOUBLE },
      		{ name: 'acceleration',    				      type: glue.Schema.DOUBLE },
      		{ name: 'acceleration_x',   		      	type: glue.Schema.DOUBLE },
      		{ name: 'acceleration_y',         			type: glue.Schema.DOUBLE },
      		{ name: 'acceleration_z',   			      type: glue.Schema.DOUBLE },
      		{ name: 'tx_power', 	    	      		  type: glue.Schema.DOUBLE },
      		{ name: 'movement_counter', 			      type: glue.Schema.DOUBLE },
      		{ name: 'measurement_sequence_number', 	type: glue.Schema.DOUBLE },
          { name: 'timestamp2',      			        type: glue.Schema.TIMESTAMP }
    	],
    	dataFormat: glue.DataFormat.JSON,
    	compressed: false,
    	description: 'Generic IoT data',
    	partitionKeys: [],
//    	partitionKeys: [{ name: 'timestamp',       			type: glue.Schema.STRING }],
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
    this.rdiCertificateId = new cdk.CfnOutput(this, 'CERTIFICATEID', {
      value: rdiCerificate.ref
    });

// Thing Url only via cli command. Is Async, cant/dont know how to put it in stack output
var exec = require('child_process').exec, child;
exec('aws iot describe-endpoint --output text --endpoint-type iot:Data-ATS',
    function (error:any, stdout:any, stderr:any) {
        console.log('----------------------------------------------------------------------------------------------------');
        console.log('Deploying IoT Serverless Stack for:');
        console.log('Account:        ' + settings.accountId);
        console.log('Region:         ' + settings.regionName);
        console.log('Prefix:         ' + settings.prefix);
        console.log('New Bucket:     ' + settings.newBucket);
        console.log('Thing Endpoint: ' + stdout.slice(0,-1));
        console.log('--------------------------------------------------------------------------------------------------------------');
//        console.log('CSR Pem:');
//        console.log(csr);
        console.log('Private Key (to be used with Ruuvi):\n');
        console.log( keyPrivate);
//        console.log('Public Key:');
//        console.log( keyPublic );
        console.log('=============================================================================================================================');
        console.log('Retrieve Certificat width:')
        console.log('aws iot describe-certificate --certificate-id $CERTIFICATEID --query "certificateDescription.certificatePem" --output text')
        console.log('=============================================================================================================================');

        if (error !== null) {
             console.log('exec error: ' + error);
        }
    });


//-------------- The End---------------
  }
}
