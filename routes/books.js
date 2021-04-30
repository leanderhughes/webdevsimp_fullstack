const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const Author = require('../models/author');
const Book = require('../models/book');
const uploadPath = path.join('public',Book.coverImageBasePath);
const imageMimeTypes = ['image/jpeg','image/png','image/gif'];
const upload = multer({
    dest:uploadPath,
    fileFilter: (req,file,callback)=>{
        callback(null,imageMimeTypes.includes(file.mimetype));
    }
});


//All authors

router.get('/',async (req,res)=>{
    let query = Book.find();
    if(req.query.title){
        query = query.regex('title',new RegExp(req.query.title,'i'));
    }
    if(req.query.publishedBefore){
        query = query.lte('publishDate',req.query.publishedBefore);
    }
    if(req.query.publishedAfter){
        query = query.gte('publishDate',req.query.publishedAfter);
    }
    try{
        const books = await query.exec();
        res.render('books/index',{
            books:books,
            searchOptions: req.query
        });
    }
    catch(e){

    }
});

//New author

router.get('/new',async (req,res)=>{
    renderNewPage(res,new Book());
});

//Create author
router.post('/', upload.single('cover') ,async (req,res)=>{
    const {title,author,publishDate,pageCount,description} = req.body;
    const params = {
        title,
        author,
        publishDate:new Date(publishDate),
        pageCount,
        coverImageName: req.file ? req.file.filename : null,
        description
    }
    const book = new Book(params);
    try{
        const newBook = await book.save();
        res.redirect('books');
    }
    catch(e){
       // console.log('Error',e);
        book.coverImageName && removeBookCover(book.coverImageName);
        renderNewPage(res,book,true);
    }
});

async function renderNewPage(res,book,hasError=false){
    try{
        const authors = await Author.find({});
        const params = {
            authors,
            book,
            errorMessage: hasError ? 'Error creating book' : null
        };
        res.render('books/new',params);
    }
    catch{
        res.redirect('/books');
    }
}

function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath,fileName),err=>{
        err && console.log(err);
    });
}

module.exports = router;