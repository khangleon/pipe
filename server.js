const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const app = express();

// serve files from the public directory
app.use(express.static('public'));

// connect to the db and start the express server
let db;

// Replace the URL below with the URL for your database
const url =  "mongodb+srv://pipe:Abcd1234@cluster0.qbooa.mongodb.net/pipedb?retryWrites=true&w=majority";

MongoClient.connect(url, {useUnifiedTopology: true}, (err, database) => {
  if(err) {
    return console.log(err);
  }
  db = database.db("pipedb");;
  // start the express web server listening on 8080
  app.listen(3000, () => {
    console.log('listening on 3000');
  });
});

// serve the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/data.html');
});

// add a document to the DB collection recording the click event
app.post('/clicked', (req, res) => {
  const click = {clickTime: new Date()};
  console.log(click);
  console.log(db);

  db.collection('employees').save(click, (err, result) => {
    if (err) {
      return console.log(err);
    }
    console.log('click added to db');
    res.sendStatus(201);
  });
});

// get the click data from the database
app.get('/clicks', (req, res) => {

    db.collection('employees').find().toArray((err, result) => {
        if (err) return console.log(err);
        res.send(result);
      });
  
});