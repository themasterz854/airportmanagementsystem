// Requiring module
var sql = require('mysql');
var fs = require('fs');
//var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('./key.pem', 'utf8');
var certificate = fs.readFileSync('./cert.pem', 'utf8');
const dotenv = require('dotenv');
dotenv.config();
var credentials = {key: privateKey, cert: certificate};
const express = require('express');
// Creating express object
const app = express();
var absolutepathofhtmlfile = __dirname + '/htmlpracticepage.html';
var absolutepathofhtml2file = __dirname + '/htmlpage2.html';
var absolutepathofassets = __dirname + '/assets';
var jsonobj = { "message": "hey"};
var name;
//var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);


app.use(express.json());
app.use(express.urlencoded({extended: true}));
// Handling GET request
app.use(function middleware(req, res, next) {
  var string = req.method + " " + req.path + " - " + req.ip;
  console.debug(string);
  next();
});
app.use(express.static(absolutepathofassets));

app.get('/', (req, res) => {
    res.sendFile(absolutepathofhtmlfile);
});
app.get(
  "/now",
  (req, res, next) => {
    req.time = new Date().toString();
    next();
  },
  (req, res) => {
    res.send({
      time: req.time
    });
  }
);

const middleware2 = (req, res, next) => {
  req.time = new Date().toString();
  next();
};

app.get("/now2", middleware2, (req, res) => {
  res.send({
    time: req.time
  });
});

app.get('/getemail',(req,res) => {
  res.sendFile(absolutepathofhtml2file);
})
app.get('/getdata',(req,res) => {
  
})
app.get('/json',(req,res) => {
  name = req.query.firstname;
  jsonobj["message"] = "Hello" + name;
  if(process.env.MESSAGE_STYLE === "uppercase")
{
  jsonobj["message"] = jsonobj["message"].toUpperCase();
}
  res.json(jsonobj);
})

app.get("/:word/echo", (req, res) => {
  const word = req.params.word;
  res.json({
    echo: word
  });
});
var j = {}
app.get('/name', function(req, res) {
   //firstName = req.query.first;
   //lastName = req.query.last;
  // OR you can destructure and rename the keys
  //var { first: firstName, last: lastName } = req.query;
  // Use template literals to form a formatted string
  res.json({
    name: `${firstName} ${lastName}`
  });
});

app.post('/name', function(req, res) {
  // Handle the data in the request
  console.log(req.body.first);
  console.log(req.body.last)
  var string = req.body.first + " " + req.body.last;
  console.log(string);
  res.json({ name: string });
});

var con = sql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hellstar#92",
  database: "nodepractice"
});
con.connect(function(err){ if (err) throw err;
  console.log("Connected!");
 app.post('/', (req,res) => {
  var FN,LN,PASS,SEX,t,tp;
   FN = req.body.firstName;
   LN = req.body.lastName;
   PASS = req.body.password;
   SEX = req.body.sex
   t = req.body.technique;
   tp = req.body.ptechnique;
   if(t === undefined)
    t = "no computer";
   if(tp === undefined)
   tp = "no phone";
   res.send({FN,LN,PASS,SEX,t,tp});
   var values = [[FN,LN,PASS,SEX]];
 
    var sql = 'INSERT INTO  CUSTOMERDATA VALUES ?';
    con.query(sql, [values], function (err, result) {
      if (err) 
      {
        
        throw err;
      }
      console.log("values inserted");
    });
  });
  FN = LN = PASS = t = tp = SEX = undefined;
 })
// Server Setup
//app.listen(PORT,console.log(
  //`Server started on port ${PORT}`));

 
  

//httpServer.listen(8080);


/*con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("CREATE DATABASE mydb", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});*/

httpsServer.listen(8443);

console.log("Server listening https on port 8443");