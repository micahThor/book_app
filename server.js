'use strict';

// dependencies
const express = require('express');
const ejs = require('ejs');
const superagent = require('superagent');
require('dotenv').config();
const PORT = process.env.PORT;
const app = express();
// added for day 02
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);

client.on('error', error => console.error(error));
client.connect();

// -------
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

// routes
app.get('/', (req, res) => {

  let SQL = `SELECT * FROM books`;

  client.query(SQL)
    .then(results => {
      if (results.rows) {
        res.render('index', { SQLResults: results.rows, bookCount: results.rowCount });
      } else {
        res.render('index');
      }
    });
});

app.get('/books/:id', (req, res) => {

  const instructions = 'SELECT * FROM books WHERE id=$1';
  const values = [req.params.id];
  client.query(instructions, values).then(results => {
    res.render('pages/books/detail', { SQLResults: results.rows });
  });

})

app.post('/searches', getBooks);

app.post('/saveBookToDB', saveToDataBase)

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));





// UTILS MODULES STUFF
function errorHandler(err, res) {
  console.error(err);
  res.render('error');
}

function saveToDataBase(req, res) {

  const instructions = 'INSERT INTO books (image_url, title, author, description, bookshelf) VALUES ($1, $2, $3, $4, $5)';
  
  const values = Object.values(req.body);

  client.query(instructions, values);
  res.redirect('/');
};


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
  this.isbn = bookItem.volumeInfo.industryIdentifiers[0].identifier;
  this.bookshelf = 'My Top Picks'
}



