const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

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
router.post('/', async (req,res)=>{
    const {title,author,publishDate,pageCount,description,cover} = req.body;
    const book = new Book({
        title,
        author,
        publishDate:new Date(publishDate),
        pageCount,
        description
    });
    saveCover(book,cover);
    try{
        const newBook = await book.save();
        res.redirect('books');
    }
    catch(e){
       // console.log('Error',e);
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

function saveCover(book, coverEncoded){
    if(!coverEncoded){
        return;
    }
    const cover = JSON.parse(coverEncoded);
    if(!cover){
        return;
    }
    if(!['image/jpeg','image/png','image/gif'].includes(cover.type)){
        return;
    }
    book.coverImage = new Buffer.from(cover.data,'base64');
    book.coverImageType = cover.type;
}

module.exports = router;