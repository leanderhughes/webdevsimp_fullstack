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

//Create book
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
        res.redirect(`books/${newBook.id}`);
    }
    catch(e){
       // console.log('Error',e);
        renderNewPage(res,book,true);
    }
});

router.get('/:id',async (req,res)=>{
    try{
        const book =  await Book.findById(req.params.id)
                                .populate('author')
                                .exec();
        res.render('books/show',{book});
    }
    catch{
       res.redirect('/'); 
    }
});

router.get('/:id/edit',async (req,res)=>{
    try{
        const book = await Book.findById(req.params.id);
        renderEditPage(res,book);
    }
    catch{
        res.redirect('/');
    }
});

router.put('/:id',async (req,res)=>{
    let book;
    try{
        const params = req.body;
        book = await Book.findById(req.params.id);
        ['title','author','publishDate','pageCount','description'].forEach(prop=>{
            if(params[prop]){
                params[prop] = prop=='publishDate' ? new Date(params[prop]) : params[prop];
                //pramas[prop] = prop=='author' ? params.authorId : params[prop];
                book[prop] = params[prop];    
            }
        });
        params.cover && saveCover(book,params.cover);
        await book.save();
        console.log('saved','params',params,req.body);
        res.redirect(`/books/${book.id}`);
    }
    catch(e){
        console.log(e);
        if(book){
            renderEditPage(res,book,true);
            return;
        }
        res.redirect('/');
    }
});

router.delete('/:id',async (req,res)=>{
    let book;
    try{
        book = await Book.findById(req.params.id);
        book.remove();
        res.redirect('/books');
    }
    catch{
        if(book){
            res.render(`books/show`,{
                book,
                errorMessage:'Could not remove book'
            });
            return;
        }
        res.redirect('/');
    }
});

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

async function renderNewPage(res,book,hasError=false){
    renderFormPage(res,book,'new',hasError);
}

async function renderEditPage(res,book,hasError=false){
    renderFormPage(res,book,'edit',hasError);
}

async function renderFormPage(res,book,form,hasError=false){
    errorMessages = {
        new: 'Error creating book',
        edit: 'Error editing book'
    };
    try{
        const authors = await Author.find({});
        const params = {
            authors,
            book,
            errorMessage: hasError ? errorMessages[form] : null
        };
       params.errorMessage && console.log(params.errorMessage);

       // form = form == 'edit' ? `${book.id}/edit` : form;
       // res.send(`OK YO HEY! ${form}`);
       // return;
        //res.send(`books/${form}`);
        res.render(`books/${form}`,params);
        //res.redirect(`/books/${form}`);
      // res.send(`/books/${form}`);//

    }
    catch(e){
        console.log(e);
        res.redirect('/books');
    }
}


module.exports = router;