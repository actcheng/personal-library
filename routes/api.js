/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});
// MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
//   if (err) throw err
//   console.log('Connection test successful!')
// });

module.exports = function (app) {

  app.route('/api/books')
     .get(function (req, res){

      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        db.collection('test').find().toArray((err,result)=>{
          if (err) throw err
          res.send(result)
        });
      });
    })

    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (title == '' | title == undefined){
        res.send('No title entered')
      } else {
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          if (err) throw err
          db.collection('test').insertOne({
            title,
            comments: [],
            "commentcount": 0
          },(err,doc)=>{
            if (err) throw err
            const display = (({title,comments,_id})=> ({title,comments,_id}))(doc.ops[0])
            // console.log('Post book:', display)
            res.json(display)
          });
        });
      }
    })

    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        db.collection('test').remove(
          {},
          (err,doc)=>{
            if (err) throw err
            // console.log('complete delete successful')
            res.send('complete delete successful')
        });
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        db.collection('test').findOne({
          _id: ObjectId(bookid)
        },(err,result)=>{
          if (err) throw err
          if (result == null){
            res.send('invalid book id')
          } else {
            const display = (({_id,title,comments})=>({_id,title,comments}))(result)
            // console.log('Get book record:', display)
            res.json(display)
          }
        });
      });
    })

    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get

      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        db.collection('test').findAndModify(
          {_id: ObjectId(bookid)},
          {},
          { $push: {comments:comment},
            $inc: {commentcount: 1}
          },
          {new:true},
          (err,result)=>{
            if (err) throw err
            if (result.value == null) {
              res.send('invalid book id')
            } else {
              const display = (({_id,title,comments})=>({_id,title,comments}))(result.value)
              // console.log('Updated book record:', display)
              res.json(display)
            }
        });
      });
    })

    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        db.collection('test').findAndModify(
          {_id: ObjectId(bookid)},
          {},
          {},
          {remove:true},
          (err,doc)=>{
            if (err) throw err
            if (doc.value == null){
              res.send('invalid book id')
            } else {
              // console.log('delete successful')
              res.send('delete successful')
            }
        });
      });
    });

};
