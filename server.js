'use strict';

// dependencies
const express = require('express');
const ejs = require('ejs');
const superagent = require('superagent');
require('dotenv').config();
const PORT = process.env.PORT;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

// routes
app.get('/', (req, res) => {
  res.render('index');
});
app.post('/searches', getBooks);

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));





// UTILS MODULES STUFF
function errorHandler(err, res) {
  console.error(err);
  res.render('error');
}


// BOOKS MODULE STUFF

function getBooks(req, res) {

  const url = getUrl(req.body.searchField, req.body.searchBy);

  superagent.get(url).then(result => {
    let firstTenBooks = result.body.items.slice(0, 11);

    let bookObjs = firstTenBooks.map(book => new Book(book));
    res.render('pages/searches/show', { books: bookObjs });
  }).catch(err => errorHandler(err, res));
}

function getUrl(searchField, searchByType) {
  let url = '';

  if (searchByType === 'author') {
    url = `https://www.googleapis.com/books/v1/volumes?q=inauthor:${searchField}`;
  } else if (searchByType === 'title') {
    url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${searchField}`;
  }

  return url;
}

function Book(bookItem) {
  this.title = bookItem.volumeInfo.title;
  this.author = bookItem.volumeInfo.authors[0];
  this.img = bookItem.volumeInfo.imageLinks.thumbnail;
  this.description = bookItem.volumeInfo.description;
}