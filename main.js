var express = require("express");
var app = express();
var port = 3000;
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var path = process.cwd();

const { Client } = require('pg');
const connectionString = 'postgres://hub:hub@localhost:5432/hubdb';
const client = new Client({
    connectionString: connectionString
});
client.connect();



app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const uri = "mongodb+srv://pipe:Abcd1234@cluster0.qbooa.mongodb.net/pipedb?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var nameSchema = new mongoose.Schema({
    firstName: String,
    lastName: String
});
var User = mongoose.model("Employee", nameSchema);

app.get("/", (req, res) => {
    client.query('SELECT * FROM Employee where id = 70101', function (err, result) {
        if (err) {
            console.log(err);
            //res.status(400).send(err);
        }
        console.log(result.rows);
        //res.status(200).send(result.rows);
        console.log("----------------");
    });

    res.sendFile(__dirname + "/data.html");
});

app.post("/addname", (req, res) => {
    var myData = new User(req.body);
    myData.save()
        .then(item => {
            res.send("Name saved to database");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});


app.route('/goData')
    .get(function (req, res) {
        res.sendFile(path + '/data.html');
    });

app.get("/views", (req, res) => {

})


app.listen(port, () => {
    console.log("Server listening on port " + port);
});