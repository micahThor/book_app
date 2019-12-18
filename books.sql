CREATE DATABASE library;

CREATE TABLE IF NOT EXISTS books (
  id serial PRIMARY KEY,
  author VARCHAR,
  title VARCHAR,
  isbn VARCHAR,
  image_url VARCHAR,
  description VARCHAR,
  bookshelf VARCHAR
);

INSERT INTO books 
VALUES (1, 'Rowling', 'Harry Potter is an Orphan', '12345',  'blank.com', 'He has no parents', 'test');