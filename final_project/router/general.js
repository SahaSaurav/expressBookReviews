const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const {username, password} = req.body;
  if(!username || !password) {
      return res.status(400).json({message: "Both username and password need to be provided"});
  }
  if(!isValid(username)) {
      return res.status(400).json({message: "Username already exists"})
  }
  users.push({username, password})
  return res.status(200).json({message: "Registered User!"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  return book ? res.status(200).send(JSON.stringify(book)) : res.status(404).json({message: `Book with isbn ${isbn} does not exist`});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.split("+").join(" ");
  const book = Object.values(books).find(b => b.author === author);
  return book ? res.status(200).send(JSON.stringify(book)) : res.status(404).json({message: `Book with author ${author} does not exist`});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.split("+").join(" ");
  const booksWithTitle = Object.values(books).filter(b => b.title === title);
  return book ? res.status(200).send(JSON.stringify(booksWithTitle)) : res.status(404).json({message: `Books with title ${title} do not exist`});

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if(!book) {
      return res.status(404).json({message: `Book with isbn ${isbn} does not exist`});
  }
  const reviews = book.reviews;
  if(Object.keys(reviews).length > 0) {
      return res.status(200).send(JSON.stringify(reviews));
  } 
  return res.status(200).json({message: `No reviews exist for book with isbn ${isbn}`});
});

module.exports.general = public_users;
