var express = require('express');
var app = express();
var router = require('./routes/api');
var bodyParser = require('body-parser');


var port = 8087 || process.env.port;
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use('/api', router);



app.listen(port, function(){
    console.log(`Server running on :${port}`);
})


