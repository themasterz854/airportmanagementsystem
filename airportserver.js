// Requiring module
var sql = require('mysql');
var fs = require('fs');
var mongo = require('mongodb');
var https = require('https');
var privateKey  = fs.readFileSync('./key.pem', 'utf8');
var certificate = fs.readFileSync('./cert.pem', 'utf8');
const { body, validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config();
var credentials = {key: privateKey, cert: certificate};
const express = require('express');

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
  });
});

// Handling GET request
app.get("/addEmployee", (req,res) => {

  res.sendFile(absolutepathofhtml+"/admin/addEmployee.html");

});
app.post("/addEmployee",  body('PhoneNo').isLength(10),body('Age').isFloat({min:0 , max:100}),(req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });}
  if(adminlog === 1)
  { 
    var FN,M,LN,Age1,Sex1,ESSN,PhoneNo,Jobtype,Addr;

    FN = req.body.FirstName;
    M = req.body.MiddleName;
    LN = req.body.LastName;
    Age1 = parseInt(req.body.Age);
    Sex1 = req.body.Gender;
    ESSN = parseInt(req.body.ESSN);
    PhoneNo =req.body.PhoneNo;

    Jobtype = req.body.JobType;
    Addr = req.body.EAddress;
   
    
    var edata = {SSN: ESSN, Fname: FN , Mname :M, Lname: LN,Age: Age1, Sex: Sex1, Phone:PhoneNo,JobType: Jobtype,Address: Addr};
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database connected mongodb!");
  var dbo = db.db("airport");
  dbo.collection("Employee").insertOne(edata,function(err){
    if(err)
    throw err;
    console.log("employee inserted");
    res.redirect("/addEmployee"); 
  });
  
});
  } 
});
app.get("/Employee", (req,res) => {
  if(adminlog === 1)
  {
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database connected mongodb!");
  var dbo = db.db("airport");
  dbo.collection("Employee").find({}).toArray(function(err, data) {
    if (err) throw err;
    console.log(data);
    
    res.render("Employee", {title:"employee", EmployeeData: data});

  });
});
}
else 
 res.send("NOT AN ADMIN");
});
app.get('/', (req, res) => {
    res.sendFile(absolutepathofhtml + "/index.html");
});
app.get("/deleteemployee", (req,res) => {
  if(adminlog === 1)
  {
  var ssn = req.query.SSND;
  ssn = parseInt(ssn);
  console.log(ssn);
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database connected mongodb!");
  var dbo = db.db("airport");
  var myquery = {SSN: ssn};
  dbo.collection("Employee").deleteOne(myquery,function(err,obj)
  {
    if (err) throw err;   
    console.log("document deleted");
  });
});
}
res.redirect("/Employee");
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
app.post("/addArrivalFlight", body('ArrivalDate').isAfter(new Date().toString()),(req,res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });}
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
app.post("/deletearrival",(req,res) => {
    var FC = req.body.FC;
    var sqlq = `delete from flight where FlightCode="${FC}"`;
    con.query(sqlq, function (err, result) {
      if (err) 
      {
        
        throw err;
      }
      console.log("value deleted");
      res.redirect("/Arrival");
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
app.post("/addDepartureFlight", body('DepartureDate').isAfter(new Date().toString()),(req,res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });}
  var FC,AN,DT,DD,to,Duration;
  FC = req.body.FlightCode;
  AN = req.body.Airline;
  DT = req.body.DepartureTime;
  DD = req.body.DepartureDate;
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

app.post("/deletedeparture",(req,res) => {
  var FC = req.body.FC;
  var sqlq = `delete from flight where FlightCode="${FC}"`;
  con.query(sqlq, function (err, result) {
    if (err) 
    {
      
      throw err;
    }
    console.log("value deleted");
    res.redirect("/Departure");
  });
});

app.get('/Arrival', (req, res, next) => {
  var sql = "SELECT FlightCode,Airline,Source,DATE_FORMAT(Arrival,'%d %m %y') as ArrivalDate,TIME_FORMAT(Arrival,'%h:%i %p') as ArrivalTime from FLIGHT where Status='Arrival'";
  con.query(sql, function(err, data, fields) {
  if (err) throw err;
  if(adminlog === 1)
  data.isadmin = "yes";
  else
  data.isadmin === "no";
  res.render('Arrival', { title: 'Arrival', ArrivalData: data});
  });
});
app.get("/Departure", (req,res) => {
  var sql = "SELECT FlightCode,Airline,Destination,DATE_FORMAT(Departure,'%d %m %y') as DepartureDate,TIME_FORMAT(Departure,'%h:%i %p') as DepartureTime from FLIGHT where Status='Departure'";
  con.query(sql, function(err, data, fields) {
  if (err) throw err;
  if(adminlog === 1)
  data.isadmin = "yes";
  else
  data.isadmin === "no";
  res.render('Departure', { title: 'Departure', DepartureData: data});
  });
});

app.get("/homeUser", (req,res) => {
  res.sendFile(absolutepathofhtml+"passenger/homeUser.html");
})
app.get("/booking", (req,res) => {
 res.sendFile(absolutepathofhtml+"/passenger/booking.html");
});

function executequeryt(sql,PID,TN,FC,DOBooking,DOT,SeatNo,Class,TOT)
{
  sql = 'insert into ticket (PID,Ticket_Number,Date_of_booking,Date_of_travel,Date_of_cancellation,SeatNo,Class) values ?';
  var Source,Destination;
  values = [[PID,TN,DOBooking,DOT,null,SeatNo,Class]];
  
  con.query(sql,[values], function (err, result) {
    if (err) 
    {
      throw err;
    }
 
    });
     sql = `SELECT Source,Destination from flight where FlightCode="${FC}" AND DATE(Departure)="${DOT}" AND TIME(Departure)="${TOT}"`; 

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
        con.query(`insert into carries values(${PID}, "${FC}")`, function (err, result) {
          if (err) 
          {
            
            throw err;
          }
         
          }); 
      });  
}
app.post("/booking", body('SeatNo').isFloat({min: 1 , max: 450}),(req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });}
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
 
  sql = "select * from ticket";
   con.query(sql, function (err, result,fields) {
    if (err) 
    { 
    }
    var i;
    //console.log(result,result.length  );

    TN = getRndInteger(1,9999);

      for(i=0;i<result.length;i++)
      {
        if(TN === result[i].Ticket_Number || TN === 0)
        {
          TN = getRndInteger(1,9999);
          i = -1;
          continue;
        }
        else
         {
           
         }
        }
        console.log("TN final = ", TN);
        executequeryt(sql,PID,TN,FC,DOBooking,DOT,SeatNo,Class,TOT);
  });
 
      console.log("ticket values inserted");
   res.redirect("/homeUser");

});
app.get("/payment",(req,res) => {

  res.sendFile(absolutepathofhtml+"/passenger/payment.html");

});

app.post("/payment",body("CardNumber").isCreditCard(), (req,res) => {
});
app.get("/ticketDetails", (req,res) => {
res.sendFile(absolutepathofhtml+"/passenger/ticketDetails.html");

});
app.post("/ticketDetails", (req,res) => {
  var sql = `select Ticket_Number,Source,Destination,Class,SeatNo,DATE_FORMAT(Date_of_booking,"%d %m %y") as DOBOOK,DATE_FORMAT(Date_of_travel,"%d %m %y") as DOT,(select Flightcode from carries where pid=${req.body.PIDT}) as FC,(select TIME_FORMAT(Departure,"%r") from flight where flightcode=(select flightcode from carries where PID=${req.body.PIDT})) as DepartureTime from ticket where PID=${req.body.PIDT}`;
  con.query(sql, function (err, data) {
    if (err) 
    {
      
      throw err;
    }
    res.render("ticketDetails", {title:"Ticket", TicketData:data});
    }); 
  
  
});

app.post("/deleteticket",(req,res) => {
  
  var TN = req.body.TN;
  console.log(TN);
  var sqlq;
  sqlq = `delete from ticket where Ticket_Number=${TN}`;
  con.query(sqlq, function (err) {
    if (err) 
    { 
      
    }
    console.log("ticket deleted");
    res.redirect("/ticketDetails");
  });
  
});
app.post("/passengerdetails", (req,res) =>{
var pid = req.body.formpid;
var sql;
 sql = `select *,(select pid from passenger1 where pid=${pid}) as PID from passenger2 where passportno= (select passportno from passenger1 where pid=${pid})`;
 con.query(sql, function (err, data) {
  if (err) 
  { 

  }
  res.render("passengerdetails",{title:"passengerdetails", PassengerData:data});
});
});
app.get("/passengerdetails", (req,res) => {
 
  res.sendFile(absolutepathofhtml+"/passenger/passengerdetails.html");
 
 });
app.get("/addpassengerdetails" , (req,res)=> {
res.sendFile(absolutepathofhtml+"/passenger/addpassengerdetails.html");
});

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

var pid;
function executequery(sql,pid,Fname,Mname,Lname,Age,Sex,Phone,Passport,Address){
  console.log("PID in function", pid);
  sql = `insert into passenger1 values(${pid},"${Passport}")`;
 
  con.query(sql, function (err, result,fields) {
    if (err) 
    { 
    }
    console.log("values inserted");
  });
 values = [[Passport,Fname,Mname,Lname,Address,Phone,Sex,Age]];
 sql =  "insert into passenger2 values ?";
  con.query(sql,[values], function (err, result,fields) {
    if (err) 
    { 
    }
    console.log("values inserted");
});
}
app.post("/addpassengerdetails",body('PhoneNo').isLength(10),body('Age').isNumeric({min:0, max:100}),(req,res)=> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });}
 var sql;
  var Fname,Mname,Lname,Age,Sex,Phone,Passport,Address;
  Fname = req.body.Fname;
  Mname = req.body.Mname;
  Lname = req.body.Lname;
  Age = req.body.Age;
  Sex =  req.body.Gender;
  Phone = req.body.PhoneNo;
  Passport = req.body.PassportNo;
  Address = req.body.Address;
  sql = "select * from passenger1";
   con.query(sql, function (err, result,fields) {
    if (err) 
    { 
    }
    var i;
    //console.log(result,result.length  );

    pid = getRndInteger(1,1000);

      for(i=0;i<result.length;i++)
      {
        if(pid === result[i].PID || pid === 0)
        {
          pid = getRndInteger(1,1000);
          i = -1;
          continue;
        }
        else
         {
           
         }
        }
        console.log("PID final = ", pid);
        executequery(sql,pid,Fname,Mname,Lname,Age,Sex,Phone,Passport,Address);
  });
  
  res.redirect("/addpassengerdetails");
   
});

app.get("/getpid", (req,res) =>{

res.send(`your pid is ${pid} , Please note it down, it will only appear this once`);  
});
//login

 app.post('/',(req,res) => {
   if(req.body.formName === "register")
   {
    body('email').isEmail();
   }
   body('userid').isAlphanumeric();
   body('pass').isStrongPassword();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });}
  
  var UserID,PASS,sql;
  UserID = req.body.userid;
  PASS = req.body.pass;
  console.log(UserID, PASS, req.body.formName);
  if(req.body.formName === "login"){ 
    sql = `SELECT UserID,Pass,Type FROM LOGINDATA WHERE UserID="${UserID}" AND Pass=(select sha2("${PASS}",512))`;
    con.query(sql,function (err, result,fields) {
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
  }
  else
  { 
    var email = req.body.email;
    sql = `insert into logindata values("${UserID}",(select sha2("${PASS}",512)),"user","${email}")`;
    con.query(sql ,function (err) {
    console.log("values inserted");
    res.redirect("/");

    });
  } 
}); 
 });


httpsServer.listen(8443);

console.log("Server listening https on port 8443");