const express = require('express');

const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('index.html')
});

app.listen(3000, () => console.log('server is running in port 3000'));
