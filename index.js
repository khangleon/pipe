const express = require("express");
const app = express();
const fs = require("fs");
const config = require("./config");
const initUserController = require("./api/controller/initUserController");

const server = require('http').Server(app);
const io = require('socket.io')(server);
const users = {};

const port = process.env.PORT || 8000;


//console.log(config.getDBConnection())

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//const MongoClient = require('mongodb').MongoClient;
//const uri = "mongodb+srv://pipe:Abcd1234@cluster0.qbooa.mongodb.net/pipedb?retryWrites=true&w=majority";
const mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose.connect(config.getDBConnection(), { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if (err) throw err;
  console.log('connect mongoose successfull');
})

app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

initUserController(app);

app.post('/add', (req, res) => {

  let Comments = mongoose.model('comments', new Schema({
    content: String,
    dateTime: Date
  }));

  Comments.create([{
    content: req.body.comment,
    dateTime: req.body.dateTime
  }], (err, comments) => {
    if (err) throw err;
    //console.log(comments);
    res.send(comments);
  })

})

app.get('/list-comments', (req, res) => {
  const Comments = mongoose.model('comments', new Schema({
    content: String,
    dateTime: Date
  }));

  Comments.find({}, (err, comments) => {
    if (err) throw err;
    //console.log(comments);
    res.send(comments);
  });

});

app.get('/search-comments', (req, res) => { 

  const Comments = mongoose.model('comments', new Schema({
    content: String,
    dateTime: Date
  }));

  Comments.find({}, (err, comments) => {
    if (err) throw err;
    res.send(comments);
  });

});

app.get("/video", (req, res) => {
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 61MB)
  const videoPath = "data/bigbuck.mp4";
  const videoSize = fs.statSync(videoPath).size;

  //console.log('range: ' + range.replace(/\D/g, ""));

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

io.sockets.on('connection', function (socket) {
  console.log('new 1 client connection: ' + socket.id)
  socket.on('new user', function (name, data) {
    if (name in users) {
      data(false);
    } else {
      data(true);
      socket.nickname = name;
      users[socket.nickname] = socket;
      console.log('add nickName');
      updateNickNames();
    }

  });

  function updateNickNames() {
    io.sockets.emit('usernames', Object.keys(users));
  }
  socket.on('open-chatbox', function (data) {
    users[data].emit('openbox', { nick: socket.nickname });
  });
  socket.on('send message', function (data, sendto) {
    users[sendto].emit('new message', { msg: data, nick: socket.nickname, sendto: sendto });
    users[socket.nickname].emit('new message', { msg: data, nick: socket.nickname, sendto: sendto });

    console.log(data);
  });
  socket.on('disconnect', function (data) {
    if (!socket.nickname) return;
    delete users[socket.nickname];
    updateNickNames();
  });
});

server.listen(port, () => {
  console.log("Listening on port " + port);
});


