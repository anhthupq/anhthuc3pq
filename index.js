const express = require('express');

const app = express();
const logger = require('morgan');
const query = require('./src/query')
const database = require('./src/database')


app.use(express.json());
app.use('/public',express.static('public'));
app.use('/',query);
app.use('/database',database)

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/public/index.html')
});

app.listen(3000, () => console.log(`goto http://localhost:3000`));
