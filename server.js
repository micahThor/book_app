'use strict';

// dependencies
const express = require('express');
const ejs = require('ejs');
const superagent = require('superagent');
const methodoverride = require('method-override');
require('dotenv').config();
const PORT = process.env.PORT;
const app = express();

// database dependencies
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => console.error(error));
client.connect();

// express & ejs configurations
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.use(methodoverride('_method'));

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

app.get('/books/:id', getDetailsAboutBook);

app.get('/searchPage', goToSearchPage);

app.post('/searches', getBooks);

app.post('/saveBookToDB', saveToDataBase);

app.post('/updateBookToDB', updateToDataBase);

app.delete('/removeBook', removeBookFromShelf)

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));





// UTILS MODULES STUFF
function errorHandler(err, res) {
  console.error(err);
  res.render('error');
}



// ROUTE HANDLERS
//
// saves a selected book to the database on saveToDataBase route
function saveToDataBase(req, res) {
  const instructions = 'INSERT INTO books (image_url, isbn, title, author, description, bookshelf) VALUES ($1, $2, $3, $4, $5, $6)';
  
  const values = Object.values(req.body);
  client.query(instructions, values);
  res.redirect('/');
};

// redirects user to selected book page with details about book on getDetailsAboutBook route
function getDetailsAboutBook(req, res) {
  const instructions = 'SELECT * FROM books WHERE id=$1';
  const values = [req.params.id];

  client.query(instructions, values).then(results => {
    client.query('SELECT DISTINCT bookshelf FROM books').then( resultbookShelf => {
      res.render('pages/books/detail', { SQLResults: results.rows, shelf: resultbookShelf.rows });
    });
  });
}

// updates data about book based on user input on updateToDataBase route
function updateToDataBase(req, res) {
  
  const updateInstructions = 'UPDATE books SET title=$1, author=$2, isbn=$3, description=$4, bookshelf=$5 WHERE id=$6';
  const values = Object.values(req.body);
  client.query(updateInstructions, values);
  res.redirect('/');
}

// removes a book from user's bookshelf on removeBookFromShelf route
function removeBookFromShelf(req, res) {

  client.query('DELETE FROM books WHERE id=$1', [req.body.bookToDelete]).then(() => {
    res.redirect('/');
  });
}

function goToSearchPage(req, res) {
  res.render('./pages/searches/search.ejs');
}


// BOOKS MODULE STUFF\
function getBooks(req, res) {
  const url = getUrl(req.body.searchField, req.body.searchBy);

  superagent.get(url).then(result => {
    let firstTenBooks = result.body.items.slice(0, 11);
    let bookObjs = firstTenBooks.map(book => new Book(book.volumeInfo));
    
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
  this.title = bookItem.title || 'No Title Avaialable';
  this.author = bookItem.authors ? bookItem.authors[0] : 'No Author Available';
  this.img = bookItem.imageLinks ? bookItem.imageLinks.thumbnail : 'https://image.flaticon.com/icons/png/512/130/130304.png';
  this.description = bookItem.description || 'No Description Available';
  this.isbn = bookItem.industryIdentifiers ? `${bookItem.industryIdentifiers[0].type} ${bookItem.industryIdentifiers[0].identifier}` : 'No ISBN Available';
  this.bookshelf = 'My Top Picks';
}



