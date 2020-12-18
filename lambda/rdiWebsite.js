const aws = require("aws-sdk");
const AthenaExpress = require("athena-express");
const athenaExpressConfig = { aws, s3: 's3://' + process.env.bucketName + '/athena/' };
const athenaExpress = new AthenaExpress(athenaExpressConfig);
const ses = new aws.SES({ region: process.env.regionName });


var SesOutput = '';
SesOutput += "Cleunup ruuvi Data";
SesOutput += "\nStartTime: " + new Date();
SesOutput += "\n";

//********************************************************************************************************************
// Website handler
exports.website_handler = async (event, context, callback) => {
	var table = '"' + process.env.databaseName + '"."' + process.env.tableName +'"';
	const sqlQuery = `SELECT timestamp2, temperature, humidity, pressure, acceleration, acceleration_x, acceleration_y, acceleration_z, tx_power, movement_counter, measurement_sequence_number
					  FROM ` + table + `
					  where timestamp2 > now() - interval '2' day
					  order by timestamp2;`;
//	const sqlQuery = "SELECT timestamp2, temperature, humidity, pressure, acceleration, acceleration_x, acceleration_y, acceleration_z, tx_power, movement_counter, measurement_sequence_number FROM " + table + " order by timestamp2;;
	rdiLog('RDI: Table: ', table);
	rdiLog('RDI: SQL: ', sqlQuery);

	try {
		let results = await athenaExpress.query(sqlQuery);
		callback(null, { statusCode: 200, body: rdi_createPage(results), headers: {'content-type': 'text/html'} });
	} catch (error) {
		callback(error, null);
	}
};

//********************************************************************************************************************
// Logging + store text for email
function rdiLog(a,b,c,d,e,f)
{
	var temp='';
	if (a) temp += a;
	if (b) temp += b;
	if (c) temp += c;
	if (d) temp += d;
	if (e) temp += e;
	if (f) temp += f;
	console.log(temp);
	SesOutput += '\n' + temp;
}
//********************************************************************************************************************
// Sent SentEmail
function rdiSendEmail(subject)
{
	if (process.env.toEmail && process.env.toEmail.length>0)
	{
		var params = {
	    Destination: {
	      ToAddresses: [process.env.toEmail],
	    },
	    Message: {
	      Body: {
	        Text: { Data: SesOutput },
	      },

	      Subject: { Data: subject },
	    },
	    Source: process.env.fromEmail,
	  };
    return ses.sendEmail(params).promise()
	}
}

//********************************************************************************************************************
// Cleanup handler
exports.cleanup_handler = async (event, context, callback) => {
	const table  = '"' + process.env.databaseName + '"."' + process.env.tableName +'"';
	//const sqlQuery = `delete FROM ` + table + `where timestamp2 < now() - interval '15' day`;
	// Athena cant do deletes
	// so selecting all paths and then delete
	const sqlQuery  = `Select "$path"  as fullFileName   FROM ` + table + ` where timestamp2 < now() - interval '7' day`;
	const sqlQuery2 = `Select count(*) as aantal         FROM ` + table + ` where timestamp2 < now() - interval '7' day`;
	rdiLog('RDI: Cleanup data');
	rdiLog('RDI: Region:        ', process.env.regionName);
	rdiLog('RDI: From:          ', process.env.fromEmail);
	rdiLog('RDI: To:            ', process.env.toEmail);
	rdiLog('RDI: Athena Buchet: ', 's3://' + process.env.bucketName + '/athena/')
	rdiLog('RDI: Table:         ', table);
	rdiLog('RDI: SQL:           ', sqlQuery);
	rdiLog('');

	try {
		var results = await athenaExpress.query(sqlQuery);
		rdiLog('RDI: Found: ' + results.Items.length + ' record(s) for cleaning.');
		rdi_cleanupS3(results)

		var results2 = await athenaExpress.query(sqlQuery2);
		rdiLog('');
		rdiLog('RDI: Selected records after cleanup: ' + results2.Items[0].aantal )
		rdiLog('RDI: Deleted: ' + (results.Items.length - results2.Items[0].aantal) + ' record(s)')
		rdiLog('RDI: Note: Delete might still be in progress.')

		rdiSendEmail(process.env.clientId + ' cleanup: Succes')

		rdiLog('RDI: The end');
	} catch (error) {
		rdiLog('RDI: !!!Error in Cleanup: ' + error);
	}
};

//********************************************************************************************************************
// Cleanup
function rdi_cleanupS3(result)
{
	var data=result.Items;
	// exemple filename: s3://rdiricdijk-bucket/rdiricdijk2020/12/07/04/rdiricdijkDeliveryStreamRuuviS3-1-2020-12-07-04-27-06-fa558435-6389-41be-9e8e-d32446a424cd
	var lookupKey=[];

	var bucketStart;
	var bucketSize=1000; //AWS limits max 1000 deletes per request
	for (bucketStart=0; bucketStart<data.length; bucketStart+=bucketSize)
	{
		var loopEnd=Math.min(data.length, bucketStart+bucketSize)
//		var loopEnd=Math.min(loopEnd,bucketStart+5)//testing
		var displayText = bucketStart+' to ' + (loopEnd-1);
		rdiLog('RDI: Deleting records: ' + displayText);

		var deleteFileList=[];
	  for (var i=bucketStart; i<loopEnd; i++)
		{
			var pos      = data[i].fullFileName.slice(6).indexOf('/')+6 //find /after bucket name
			var bucket   = data[i].fullFileName.slice(5, pos);
			var fileName = data[i].fullFileName.slice(pos+1);

			lookupKey[i]=fileName; //key to lookup which batch was deletd to put in console log
			deleteFileList.push({Key: fileName})
		}
		var deleteParam = {
	    Bucket: bucket,
	    Delete: {  Objects: deleteFileList }
		};
		var s3 = new aws.S3();
		// ACtual deletion. Happens async. However I cannot await result (e.g. with a promise construction)
		// Seems like the single delete call 'deleteObject', can be deleted.
		// Choose not to use single file deletion, because the number of files would result in a lot of calls
		// And is is a non critical background proces (doesm't matter if the error gets logged on a later moment)
	  s3.deleteObjects(deleteParam, function(err, dat) {
				const subj = process.env.clientId + ' cleanup: ';
			  if (err)
				{
					rdiLog(err, err.stack);
					rdiSendEmail(subj + '!!!!Error')
				}
		    else {
					if (dat.Errors.length) {
						rdiLog('RDI: !!!Error deleting objects: ', dat.Errors);
						rdiSendEmail(subj + '!!!Error')
					}
					else {
						var start=lookupKey.indexOf(dat.Deleted[0].Key);
						var startNr = Math.floor(start/bucketSize)*bucketSize; //We only get 1 id and dont know which id we get so floor to bucketSize
						rdiLog('RDI: deleteObjects (' + startNr + ' to ' + (startNr+bucketSize) + '): Success' );
					}
				}
		});
	}

}


//********************************************************************************************************************
// Website
function rdi_createPage(result)
{
	var data=result.Items;
	var page='';

	page += "<!DOCTYPE html>\n<html>\n<head>";
	page += "\n</head>\n<body>";

	page += '\n<script type="text/javascript" src="https://www.google.com/jsapi"></script>';
	page += '\n<script type="text/javascript">'
	page += '\ngoogle.load("visualization", "1", {packages: ["corechart"], "language": "nl"});';
	page += '\ngoogle.setOnLoadCallback(richd_init)';

	page += '\nvar rvdChart; var rvdData;	var rvdOptions;';
	page += "\nvar rowData = [['time', 'temp', 'hum', 'pres', 'acc', 'accx', 'accy', 'accz', 'tx', 'count', 'seq']";
	for (var i=0; i<data.length;i++)
	{
		page += "\n,['"+ data[i].timestamp2.slice(8,16) + "'";
		page += ", " + data[i].temperature;
		page += ", " + data[i].humidity;
		page += ", " + data[i].pressure;
		page += ", " + data[i].acceleration;
		page += ", " + data[i].acceleration_x;
		page += ", " + data[i].acceleration_y;
		page += ", " + data[i].acceleration_z;
		page += ", " + data[i].tx_power;
		page += ", " + data[i].movement_counter;
		page += ", " + data[i].measurement_sequence_number;
		page += "]";
	}
	page += "];";

	page += `
function richd_init()
{
	rvdChart = new google.visualization.ComboChart(document.getElementById('div_chart'));

	cols =[0];
	color=[];
	as=[];
	i=0;

	if (document.getElementById('temp').checked) 	{cols.push(1); color.push('green');				as[i]={targetAxisIndex:0}; i++; }
	if (document.getElementById('hum').checked) 	{cols.push(2); color.push('orange');				as[i]={targetAxisIndex:0}; i++; }
	if (document.getElementById('pres').checked) 	{cols.push(3); color.push('red');				as[i]={targetAxisIndex:1}; i++; }
	if (document.getElementById('acc').checked) 	{cols.push(4); color.push('#ccc');				as[i]={targetAxisIndex:2}; i++; }
	if (document.getElementById('accx').checked) 	{cols.push(5); color.push('#cca');				as[i]={targetAxisIndex:2}; i++; }
	if (document.getElementById('accy').checked) 	{cols.push(6); color.push('#cac');				as[i]={targetAxisIndex:2}; i++; }
	if (document.getElementById('accz').checked) 	{cols.push(7); color.push('#acc');				as[i]={targetAxisIndex:2}; i++; }
	if (document.getElementById('tx').checked) 		{cols.push(8); color.push('lightsteelblue');	as[i]={targetAxisIndex:0}; i++; }
	if (document.getElementById('mc').checked) 		{cols.push(9); color.push('blue');			as[i]={targetAxisIndex:4}; i++; }
	if (document.getElementById('ms').checked) 		{cols.push(10); color.push('purple');			as[i]={targetAxisIndex:3}; i++; }

	var chartData = google.visualization.arrayToDataTable(rowData);
	var rvdView      = new google.visualization.DataView(chartData);
	rvdOptions=
	{
		title : 'Ruuvi Serverless',
		width: 980,
		height: 600,
		vAxis: {title: "(C, %)"},
		reverseCategories: false,
		seriesType: "line",
		legend: {position: 'bottom'},
		vAxis: {gridlines: {count:6} },
		focusTarget: "category",
		backgroundColor: {stroke: 'black', strokeWidth: 1},
		chartArea: {left:75, width:750, top: 50, height:470},
		vAxes: {0: {minValue:0, logScale: false, title:'0-100'},
				1: {textPosition:'in', minValue:940, logScale: false, title:'Pressure'},
				2: {minValue:0, logScale: false, title:'Acceleration'},
				4: {minValue:0, logScale: false, title:'Counter'},
				3: {minValue:0, logScale: false, title:'Sequence'} },
		colors: color,
		series: as
	}



	rvdView.setColumns(cols);
	rvdChart.draw(rvdView, rvdOptions);
}`;

	page += '\n</script>'
	page += "\n<div id=div_chart></div>";
	page +=
	`
		<INPUT style='margin-left:10px;' onchange=richd_init() TYPE=CHECKBOX ID=temp   NAME=temp 	VALUE=1 checked>Temp
		<INPUT style='margin-left:10px;' onchange=richd_init() TYPE=CHECKBOX ID=hum    NAME=hum  	VALUE=1 checked>Hum
		<INPUT style='margin-left:10px;' onchange=richd_init() TYPE=CHECKBOX ID=pres   NAME=pred  	VALUE=1 >Pres
		<INPUT style='margin-left:10px;' onchange=richd_init() TYPE=CHECKBOX ID=acc    NAME=acc  	VALUE=1 >Acc
		<INPUT style='margin-left:10px;' onchange=richd_init() TYPE=CHECKBOX ID=accx   NAME=accx  	VALUE=1 >Acc-X
		<INPUT style='margin-left:10px;' onchange=richd_init() TYPE=CHECKBOX ID=accy   NAME=accy  	VALUE=1 >Acc-Y
		<INPUT style='margin-left:10px;' onchange=richd_init() TYPE=CHECKBOX ID=accz   NAME=accz  	VALUE=1 >Acc-Z
		<INPUT style='margin-left:10px;' onchange=richd_init() TYPE=CHECKBOX ID=tx     NAME=tx    	VALUE=1 >TX Power
		<INPUT style='margin-left:10px;' onchange=richd_init() TYPE=CHECKBOX ID=mc     NAME=mc    	VALUE=1 >Counter
		<INPUT style='margin-left:10px;' onchange=richd_init() TYPE=CHECKBOX ID=ms     NAME=ms    	VALUE=1 >Sequence
	`

	page += "\n</body>\n</html>";

	return page;
}
