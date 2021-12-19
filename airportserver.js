// Requiring module
var sql = require('mysql');
var fs = require('fs');
var mongo = require('mongodb');
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
const { DATETIME, DATE } = require('mysql/lib/protocol/constants/types');
const { randomInt } = require('crypto');
var adminlog = 0;
// Creating express object
const app = express();
var absolutepathofhtml = __dirname + "/AirportAssets/html/";
var absolutepathofassets = __dirname + '/public';
var name;
var httpsServer = https.createServer(credentials, app);

app.set('views', __dirname + "\\AirportAssets\\views");
app.set('view engine', 'ejs');


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(absolutepathofassets));
console.log(__dirname);
//SQL 
var sqlcondata = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    multipleStatements: true
    }
    var con = sql.createConnection(sqlcondata);
    con.connect(function(err){ if (err) throw err;
      console.log("Connected to database " + sqlcondata["database"] + "!");
    app.use(function middleware(req, res, next) {
      var string = req.method + " " + req.path + " - " + req.ip;
      console.debug(string);
      next();
    });

//MongoDB

var MongoClient = mongo.MongoClient;
var url = "mongodb://127.0.0.1:27017";
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database connected mongodb!");
  var dbo = db.db("airport");
  dbo.collection("Employee").find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });
});

// Handling GET request
app.get("/Employee")
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
});

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
});

app.get("/addArrivalFlight", (req,res) => {
    if(adminlog === 1)
    {
        res.sendFile(absolutepathofhtml+"admin/addArrivalFlight.html");
    }
    else
    {
        res.send("NOT ADMIN");
    }
});
app.post("/addArrivalFlight", (req,res) =>{
  var FC,AN,AT,AD,From;
  FC = req.body.FlightCode;
  AN = req.body.Airline;
  AT = req.body.ArrivalTime;
  AD = req.body.ArrivalDate;
  From = req.body.From;
  AD.replace('T', ' ');
  var values = [[FC,AN,From,null,AD+" " +AT,null,null,"Arrival","NONSTOP"]];
  var sql = "insert into flight values ?";
  con.query(sql,[values], function (err, result) {
    if (err) 
    {
      
      throw err;
    }
    console.log("values inserted");
    res.redirect("/addArrivalFlight");
  });
});
app.get("/addDepartureFlight", (req,res) => {
    if(adminlog === 1)
    {
        res.sendFile(absolutepathofhtml+"admin/addDepartureFlight.html");
    }
    else
    {
        res.send("NOT ADMIN");
    }
});
app.post("/addDepartureFlight", (req,res) =>{
  var FC,AN,DT,DD,to,Duration;
  FC = req.body.FlightCode;
  AN = req.body.Airline;
  DT = req.body.DepartureTime;
  DD = req.body.DeparturelDate;
  to = req.body.to;
  Duration = req.body.Duration;
  DD.replace('T', ' ');
  var values = [[FC,AN,null,to,null,DD+" " +DT,Duration,"Departure","NONSTOP"]];
  var sql = "insert into flight values ?";
  con.query(sql,[values], function (err, result) {
    if (err) 
    {
      
      throw err;
    }
    console.log("values inserted");
    res.redirect("/addDepartureFlight");
  });
});


app.get('/Arrival', (req, res, next) => {
  var sql = "SELECT FlightCode,Airline,Source,DATE_FORMAT(Arrival,'%d %m %y') as ArrivalDate,TIME_FORMAT(Arrival,'%h:%i %p') as ArrivalTime from FLIGHT where Status='Arrival'";
  con.query(sql, function(err, data, fields) {
  if (err) throw err;
  res.render('Arrival', { title: 'Arrival', ArrivalData: data});
  });
});
app.get("/Departure", (req,res) => {
  var sql = "SELECT FlightCode,Airline,Destination,DATE_FORMAT(Departure,'%d %m %y') as DepartureDate,TIME_FORMAT(Departure,'%h:%i %p') as DepartureTime from FLIGHT where Status='Departure'";
  con.query(sql, function(err, data, fields) {
  if (err) throw err;
  res.render('Departure', { title: 'Departure', DepartureData: data});
  });
});
app.get("/addEmployee", (req,res) => {
    if(adminlog === 1)
    {
        res.sendFile(absolutepathofhtml+"admin/addEmployee.html");
    }
    else
    {
        res.send("NOT ADMIN");
    }
});
app.get("/Employee", (req,res) => {
    if(adminlog === 1)
    {
        res.sendFile(absolutepathofhtml+"admin/Employee.html");
    }
    else
    {
        res.send("NOT ADMIN");
    }
});

app.get("/homeUser", (req,res) => {
  res.sendFile(absolutepathofhtml+"passenger/homeUser.html");
})
app.get("/booking", (req,res) => {
 res.sendFile(absolutepathofhtml+"/passenger/booking.html");
});

app.post("/booking", (req,res) => {
  var PID,FC,Class,TN,Source,Destination,DOBooking,DOT,DOC,SeatNo,TOT;
  console.log(req.body);
  PID = req.body.PID;
  FC = req.body.FlightCode;
  Class = req.body.class;
  var date = new Date();
  var day = ("0" + date.getDate()).slice(-2);
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var year = date.getFullYear(); 
  DOBooking = year + "-" + month + "-" + day;
  DOT = req.body.DDate;
  DOT = DOT.replace('T',' ');
  TOT = req.body.Dtime;
  SeatNo = req.body.SeatNo;
 
  TN = randomInt(1,9999);
  sql = 'insert into ticket (PID,Ticket_Number,Date_of_booking,Date_of_travel,Date_of_cancellation,SeatNo,Class) values ?';
  values = [[PID,TN,DOBooking,DOT,null,SeatNo,Class]];

  con.query(sql,[values], function (err, result) {
    if (err) 
    {
      throw err;
    }
 
    });
    var sql = `SELECT Source,Destination from flight where FlightCode="${FC}" AND DATE(Departure)="${DOT}" AND TIME(Departure)="${TOT}"`; 

    con.query(sql, function (err, result) {
      if (err) 
      {
        
        throw err;
      }
      Source = result[0].Source;
      Destination=result[0].Destination;
      con.query(`update ticket set Source="${Source}",Destination="${Destination}" where PID=${PID}`, function (err, result) {
        if (err) 
        {
          
          throw err;
        }
       
        }); 
        con.query(`insert into carries values(${PID}, "${FlightCode}")`, function (err, result) {
          if (err) 
          {
            
            throw err;
          }
         
          }); 
      });  
      console.log("ticket values inserted");
   res.redirect(`/booking?PID=${PID}`);

});

app.get("/ticketDetails", (req,res) => {
  var sql = `select Ticket_Number,Source,Destination,Class,SeatNo,DATE_FORMAT(Date_of_booking,"%d %m %y") as DOBOOK,DATE_FORMAT(Date_of_travel,"%d %m %y") as DOT,(select Flightcode from carries where pid=${req.query.PID}) as FC,(select TIME_FORMAT(Departure,"%r") from flight where flightcode=(select flightcode from carries where PID=${req.query.PID})) as DepartureTime from ticket where PID=${req.query.PID}`;
  con.query(sql, function (err, data) {
    if (err) 
    {
      
      throw err;
    }
    res.render("ticketDetails", {title:"Ticket", TicketData:data});
    }); 
  
  
});
//login
 app.post('/', (req,res) => {
  var UserID,PASS;
  UserID = req.body.userid;
  PASS = req.body.pass;
 
    var sql = `SELECT UserID,Pass,Type FROM LOGINDATA WHERE UserID= "${UserID}" AND Pass="${PASS}"`;
    console.log(sql);
    con.query(sql, function (err, result,fields) {
      if (err) 
      { 
      }
      if(result.length === 0)
      { 
        res.send("wrong username or password");
      }
      else if(result[0].Type === "admin")
      { 
          adminlog =1;
        res.redirect("/Adminhome");
      }
      else
      {
        res.redirect("/homeUser");
      }
        
    
      console.log("login done");
    });
  });
  
 })


httpsServer.listen(8443);

console.log("Server listening https on port 8443");