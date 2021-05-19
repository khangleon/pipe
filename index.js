const express = require("express");
const app = express();
const fs = require("fs");
const port = process.env.PORT || 8000;

const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

const urlencodedParser = bodyParser.urlencoded({ extended: false })

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://pipe:Abcd1234@cluster0.qbooa.mongodb.net/pipedb?retryWrites=true&w=majority";


app.use(express.static(__dirname + '/public'));


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get('/login', urlencodedParser, function (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.write('welcome you posted:\n')
  res.end(JSON.stringify(req.body, null, 2))

})

app.get("/views", urlencodedParser, (req, res) => {

  MongoClient.connect(uri, { useUnifiedTopology: true }, (err, db) => {
    if (err) throw err;
    let dbo = db.db("pipedb");
    dbo.collection("users").findOne({}, function (err, result) {
      if (err) throw err;
      //console.log(result);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(result))
      db.close();
    });
  });
})

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
