// Requiring module
var sql = require('mysql');
var fs = require('fs');
var https = require('https');
var privateKey  = fs.readFileSync('./key.pem', 'utf8');
var certificate = fs.readFileSync('./cert.pem', 'utf8');
const dotenv = require('dotenv');
dotenv.config();
var credentials = {key: privateKey, cert: certificate};
const express = require('express');
const exp = require('constants');
const res = require('express/lib/response');
const req = require('express/lib/request');
var adminlog = 0;
// Creating express object
const app = express();
var absolutepathofhtml = __dirname + "/AirportAssets/html/";
var absolutepathofassets = __dirname + '/public';
var name;
var httpsServer = https.createServer(credentials, app);

app.set('views', __dirname);
app.set('view engine', 'ejs');


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(absolutepathofassets));

//SQL 
var sqlcondata = {
    host: "localhost",
    user: "root",
    password: "Hellstar#92",
    database: "airport"}
    var con = sql.createConnection(sqlcondata);
    con.connect(function(err){ if (err) throw err;
      console.log("Connected to database " + sqlcondata["database"] + "!");
    app.use(function middleware(req, res, next) {
      var string = req.method + " " + req.path + " - " + req.ip;
      console.debug(string);
      next();
    });
// Handling GET request


app.get('/table1', function(req, res, next) {
  var sql='SELECT * FROM customerdata';
  con.query(sql, function (err, data, fields) {
  if (err) throw err;
  res.render('table1', { title: 'table', userData: data});
});
});
app.get('/', (req, res) => {
    res.sendFile(absolutepathofhtml + "/index.html");
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
app.get("/Adminhome", (req,res) => {
    if(adminlog === 1)
    res.sendFile(absolutepathofhtml+"admin/Adminhome.html");
    else
    {
        res.redirect("/");
    }
})

app.get("/addArrivalFlight", (req,res) => {
    if(adminlog === 1)
    {
        res.sendFile(absolutepathofhtml+"admin/addArrivalFlight.html");
    }
    else
    {
        res.send("NOT ADMIN");
    }
})

app.get("/addDepartureFlight", (req,res) => {
    if(adminlog === 1)
    {
        res.sendFile(absolutepathofhtml+"admin/addDepartureFlight.html");
    }
    else
    {
        res.send("NOT ADMIN");
    }
})

app.get("/Arrival", (req,res) => {
  
        res.sendFile(absolutepathofhtml+"admin/Arrival.html");
})
app.get("/Departure", (req,res) => {
    
        res.sendFile(absolutepathofhtml+"admin/Departure.html");
})
app.get("/addEmployee", (req,res) => {
    if(adminlog === 1)
    {
        res.sendFile(absolutepathofhtml+"admin/addEmployee.html");
    }
    else
    {
        res.send("NOT ADMIN");
    }
})
app.get("/Employee", (req,res) => {
    if(adminlog === 1)
    {
        res.sendFile(absolutepathofhtml+"admin/Employee.html");
    }
    else
    {
        res.send("NOT ADMIN");
    }
})

//adminlogin
 app.post('/', (req,res) => {
  var UserID,PASS;
  UserID = req.body.userid;
  PASS = req.body.pass;
 
    var sql = `SELECT UserID,Pass FROM LOGINDATA WHERE UserID= "${UserID}" AND Pass="${PASS}"`;
    console.log(sql);
    con.query(sql, function (err, result,fields) {
      if (err) 
      { 
      }
      if(result.length === 0)
      { 
        res.send("wrong username or password");
      }
      else
      { 
          adminlog =1;
        res.redirect("/Adminhome");
      }
        
    
      console.log("login done");
    });
  });
  
 })


httpsServer.listen(8443);

console.log("Server listening https on port 8443");