const aws = require("aws-sdk");
const AthenaExpress = require("athena-express");
const athenaExpressConfig = { aws, s3: 's3://' + process.env.bucketName + '/athena/' };
console.log('RDI: BUCKET', 's3://' + process.env.bucketName + '/athena/')
const athenaExpress = new AthenaExpress(athenaExpressConfig);



exports.website_handler = async (event, context, callback) => {
	var table = '"' + process.env.databaseName + '"."' + process.env.tableName +'"';
	const sqlQuery = `SELECT timestamp2, temperature, humidity, pressure, acceleration, acceleration_x, acceleration_y, acceleration_z, tx_power, movement_counter, measurement_sequence_number
					  FROM ` + table + `
					  where timestamp2 > now() - interval '2' day
					  order by timestamp2;`;
//	const sqlQuery = "SELECT timestamp2, temperature, humidity, pressure, acceleration, acceleration_x, acceleration_y, acceleration_z, tx_power, movement_counter, measurement_sequence_number FROM " + table + " order by timestamp2;;
	console.log('RDI: Table: ', table);
	console.log('RDI: SQL: ', sqlQuery);

	try {
		let results = await athenaExpress.query(sqlQuery);
		callback(null, { statusCode: 200, body: rdi_createPage(results), headers: {'content-type': 'text/html'} });
	} catch (error) {
		callback(error, null);
	}
};

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
