const express = require("express");
const app = express();
const fs = require("fs");
const port = process.env.PORT || 8000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://pipe:Abcd1234@cluster0.qbooa.mongodb.net/pipedb?retryWrites=true&w=majority";

app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post('/add', (req, res) => {

  MongoClient.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  }, (err, db) => {
    if (err) throw err;

    let dbo = db.db("pipedb");

    let entity = {
      content: req.body.comment,
      dateTime: req.body.dateTime
    }

    dbo.collection("Comments").insertOne(entity, (err, records) => {
      if (err) throw err;
      console.log("1 document inserted");
      //console.log(JSON.stringify(records.ops[0]))
      res.json(records.ops[0]);
      db.close();
    });

  });

})

app.get('/list-comments', (req, res) => {
  MongoClient.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  }, (err, db) => {
    if (err) throw err;

    let dbo = db.db("pipedb");

    dbo.collection("Comments").find().toArray((err, result) => {
      if (err) return console.log(err);
      res.send(result);
    });

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

app.listen(port, () => {
  console.log("Listening on port 8000!");
});
