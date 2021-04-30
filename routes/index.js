const express = require('express');
const router = express.Router();
const Book = require('../models/book');

router.get('/',async (req,res)=>{
    let books;
    // if(req.query.title){
    //     query = query.regex('title',new RegExp(req.query.title,'i'));
    // }
    // if(req.query.publishedBefore){
    //     query = query.lte('publishDate',req.query.publishedBefore);
    // }
    // if(req.query.publishedAfter){
    //     query = query.gte('publishDate',req.query.publishedAfter);
    // }
    try{
       books = await Book.find().sort({createdAd:'desc'}).limit(10).exec();
    }
    catch(e){
        books = [];
    }
    res.render('index',{books:books});
});

module.exports = router;