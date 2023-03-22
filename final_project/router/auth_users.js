const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return !users.find(u => u.username === username);
}

const authenticatedUser = (username, password) => {
    return !!users.find(u => u.username === username && u.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.send(401).json({message: "Need to send both username and password"});
    }

    if (authenticatedUser(username, password)) {
        const token = jwt.sign({username, password}, "access", {expiresIn: 60*60});

        req.session.authorization = {token, username};

        return res.status(200).json({message: "Logged in!"});
    } 

    return res.status(401).json({ message: "Unregistered User" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const bookDetails = books[isbn];

    if(!bookDetails) {
        return res.status(404).json({message: `Book with isbn ${isbn} does not exist`});
    }

    const reviewId = req.session.authorization.username;
    const serverCopy = bookDetails.reviews[reviewId];
    const clientCopy = req.body.review;

    if (serverCopy !== clientCopy) {
        delete bookDetails.reviews[reviewId];
        bookDetails.reviews[reviewId] = clientCopy

        return res.status(200).json({message: `Added/updated review for book with isbn ${isbn}`})
    }

    return res.status(400).json({ message: "Submitted review already exists" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const bookDetails = books[isbn];
    const reviewId = req.session.authorization.username;

    if (!bookDetails) {
        return res.status(404).json({message: `Book with isbn ${isbn} does not exist`});
    }

    delete bookDetails.reviews[reviewId];

    return res.status(200).json({message: `Deleted user review for book with isbn ${isbn}`});
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
