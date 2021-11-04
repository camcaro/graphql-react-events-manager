const exp = require('constants');
const express = require('express');
//const bodyParser = require('body-parser'); now deprecated

const app = express();

//app.use(bodyParser.json()); express now able to parse json
app.use(express.json());

app.get('/', (req, res, next) => {
    res.send('Hello World!');
})

app.listen(3000);

