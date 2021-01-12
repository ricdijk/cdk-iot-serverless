var AWS = require('aws-sdk');
var translate = new AWS.Translate();


exports.handler = (event, context, callback) => {

    console.log('event',event);
    var response='';

    if (!event.queryStringParameters)
      {
         console.log('No Data');
         response = {statusCode: 200, body: JSON.stringify('!No parameters'), headers: {'content-type': 'application/json', "Access-Control-Allow-Origin": "*"} }
         callback(null, response);
         return;
     }
     if (!event.queryStringParameters.q) {
        console.log('No Data');
        response = {statusCode: 200, body: JSON.stringify('!No translation text'), headers: {'content-type': 'application/json', "Access-Control-Allow-Origin": "*"} };
        callback(null, response);
        return;
    }
    if (!event.queryStringParameters.source) event.queryStringParameters.source = 'en';
    if (!event.queryStringParameters.target) event.queryStringParameters.target   = 'auto';

    //response = {statusCode: 200, body: JSON.stringify(event.queryStringParameters), headers: {'content-type': 'application/json'} };
    //callback(null, response);


    var params = {
        Text: event.queryStringParameters.q,
        SourceLanguageCode: event.queryStringParameters.source,
        TargetLanguageCode: event.queryStringParameters.target
    };
    console.log('InputText', event.inputText);
    console.log('From', event.SourceLanguageCode);
    console.log('To', event.TargetLanguageCode);

    translate.translateText(params, function(err, data) {
        var response;
        if (err) {
            console.log(err, err.stack);
            response = {
                statusCode: 200,
                body: JSON.stringify("T!ranslation error"),
                headers: {'content-type': 'application/json', "Access-Control-Allow-Origin": "*"}
            };
        }
        if (data) {
            console.log('Translated Text:', data.TranslatedText);
            response = {
                statusCode: 200,
                body: JSON.stringify(data),
                headers: {'content-type': 'application/json', "Access-Control-Allow-Origin": "*"}
            };
        }
        callback(null, response);

    });


};
