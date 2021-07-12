const express = require('express');

const app = express();

app.use('/public',express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/public/index.html')
});

app.listen(3000, () => console.log(`goto http://localhost:3000`));
