const express = require('express');
const bodyPaser = require('body-parser');

const app = express();

app.use(bodyPaser.json());

app.get('/', (req, res, next) => {
	res.send('Hello world');
});

app.listen(3000);
