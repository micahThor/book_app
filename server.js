'use strict';

// dependencies
const express = require('express');
const ejs = require('ejs');
const superagent = require('superagent');
require('dotenv').config();
const PORT = process.env.PORT;

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

app.set('view engine', 'ejs');

app.post('/', (req, res) => {
  console.log(req.body);
  res.render('index', req.body);
});


app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

