// Requiring modules
var cookies = require("cookie-parser");
const compression = require("compression");
var sql = require("mysql");
var globalrequest;
var blockid = 1;
const fs = require("fs");
const mongo = require("mongodb");
const https = require("https");
const privateKey = fs.readFileSync("./key.pem", "utf8");
const certificate = fs.readFileSync("./cert.pem", "utf8");
const { body, validationResult } = require("express-validator");
const dotenv = require("dotenv");
dotenv.config();
const credentials = { key: privateKey, cert: certificate };
const express = require("express");
var blockcrypto = require("./cryptocurrency");

// Creating express object
const app = express();
const absolutepathofhtml = __dirname + "/AirportAssets/html/";
const absolutepathofassets = __dirname + "/public";
const httpsServer = https.createServer(credentials, app);
var cors = require("cors");
app.set("views", __dirname + "\\AirportAssets\\views");
app.set("view engine", "ejs");

let smashingCoin = new blockcrypto.CryptoBlockchain();

console.log("smashingCoin mining in progress....");

console.log(JSON.stringify(smashingCoin, null, 4));
app.use(cookies());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(absolutepathofassets));
app.use(compression());
app.use(function middleware(req, res, next) {
  var string = req.method + " " + req.path + " - " + req.ip;
  console.log(string);
  next();
});
console.log(__dirname);
//SQL
var sqlcondata = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  multipleStatements: true,
};
var con = sql.createConnection(sqlcondata);
con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to database " + sqlcondata["database"] + "!");
});

//MongoDB
var MongoClient = mongo.MongoClient;
var url = "mongodb://127.0.0.1:27017";
var client = new MongoClient(url);
var db;
client
  .connect()
  .then((database) => {
    db = database;
    console.log("Database connected mongodb!");
    var dbo = db.db("airport");
    var collection = dbo.collection("Employee");
    collection.find({}).toArray().then(
      (result) => { console.log(result)
      })
      .catch( (err) => {throw error});
  })
  .catch((err) => {
    throw err;
  });

// MongoClient.connect(url, function (err, db) {
//   if (err) throw err;
//   console.log("Database connected mongodb!");
//   var dbo = db.db("airport");
//   dbo.collection("Employee").find({}).toArray(function (err, result) {
//     if (err) throw err;
//     //console.log(result);
//   });
// });
var corsOptions = {
  origin: "http://localhost:8001",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}; //adds cors requests
app.get("/", cors(corsOptions), (req, res) => {
  if (handler.validateToken(req, res).pass === "admin") {
    res.redirect("/Adminhome");
  } else if (handler.validateToken(req, res).pass === "user") {
    res.redirect("/homeUser");
  } else res.sendFile(absolutepathofhtml + "/index.html");
});

app.get("/addEmployee", (req, res) => {
  if (handler.validateToken(req, res)) {
    res.sendFile(absolutepathofhtml + "/admin/addEmployee.html");
  } else {
    res.send("NOT AN ADMIN");
  }
});
app.post(
  "/addEmployee",
  body("PhoneNo").isLength({ min: 10, max: 10 }),
  body("Age").isFloat({ min: 0, max: 100 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (handler.validateToken(req, res)) {
      var FN, M, LN, Age1, Sex1, ESSN, PhoneNo, Jobtype, Addr;

      FN = req.body.FirstName;
      M = req.body.MiddleName;
      LN = req.body.LastName;
      Age1 = parseInt(req.body.Age);
      Sex1 = req.body.Gender;
      ESSN = parseInt(req.body.ESSN);
      PhoneNo = req.body.PhoneNo;

      Jobtype = req.body.JobType;
      Addr = req.body.EAddress;

      var edata = {
        SSN: ESSN,
        Fname: FN,
        Mname: M,
        Lname: LN,
        Age: Age1,
        Sex: Sex1,
        Phone: PhoneNo,
        JobType: Jobtype,
        Address: Addr,
      };
        var dbo = db.db("airport");
        dbo.collection("Employee").insertOne(edata, function (err) {
          if (err) throw err;
          console.log("employee inserted");
          res.redirect("/addEmployee");
        });
     
    }
    res.send("NOT AN ADMIN");
  }
);
app.get("/Employee", (req, res) => {
  if (handler.validateToken(req, res)) {
    console.log("Showing employee details");
    var dbo = db.db("airport");
    dbo
      .collection("Employee")
      .find({})
      .toArray().then(
        (data) =>  {
          res.render("Employee", { title: "employee", EmployeeData: data });
        })
        .catch((err) => {throw err});
  } else res.send("NOT AN ADMIN");
});

app.get("/deleteemployee", (req, res) => {
  if (handler.validateToken(req, res)) {
    var ssn = req.query.SSND;
    ssn = parseInt(ssn);
    var dbo = db.db("airport");
    var myquery = { SSN: ssn };
    dbo.collection("Employee").deleteOne(myquery).then(
      (obj) => {console.log("document deleted");}
    )
    .catch((err)=> {throw err});
  }
  else {res.send("NOT AN ADMIN")};

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
      time: req.time,
    });
  }
);

const middleware2 = (req, res, next) => {
  req.time = new Date().toString();
  next();
};

app.get("/now2", middleware2, (req, res) => {
  res.send({
    time: req.time,
  });
});

app.get("/:word/echo", (req, res) => {
  const word = req.params.word;
  res.json({
    echo: word,
  });
});
app.get("/Adminhome", (req, res) => {
  if (handler.validateToken(req, res))
    res.sendFile(absolutepathofhtml + "admin/Adminhome.html");
  else {
    res.redirect("/");
  }
});

app.get("/addArrivalFlight", (req, res) => {
  if (handler.validateToken(req, res)) {
    res.sendFile(absolutepathofhtml + "admin/addArrivalFlight.html");
  } else {
    res.send("NOT ADMIN");
  }
});
app.post(
  "/addArrivalFlight",
  body("ArrivalDate").isAfter(new Date().toString()),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    var FC, AN, AT, AD, From;
    AL = req.body.Airline;
    FC = req.body.FlightCode;
    AN = req.body.Airline;
    AT = req.body.ArrivalTime;
    AD = req.body.ArrivalDate;
    From = req.body.From;
    AD.replace("T", " ");

    var sql = `select AIRLINE_ID from airline where AL_NAME = "${AL}"`;
    con.query(sql, function (err, result) {
      if (err) {
        throw err;
      }

      var values = [
        [
          FC,
          AN,
          From,
          null,
          AD + " " + AT,
          null,
          null,
          "Arrival",
          "NONSTOP",
          result[0].AIRLINE_ID,
        ],
      ];
      sql = "insert into flight values ?";
      con.query(sql, [values], function (err) {
        if (err) {
          throw err;
        }
        console.log("values inserted");
        res.redirect("/addArrivalFlight");
      });
    });
  }
);
app.post("/deletearrival", (req, res) => {
  var FC = req.body.FC;
  var sqlq = `delete from flight where FlightCode="${FC}"`;
  con.query(sqlq, function (err, result) {
    if (err) {
      throw err;
    }
    console.log("value deleted");
    res.redirect("/Arrival");
  });
});
app.get("/addDepartureFlight", (req, res) => {
  if (handler.validateToken(req, res)) {
    res.sendFile(absolutepathofhtml + "admin/addDepartureFlight.html");
  } else {
    res.send("NOT ADMIN");
  }
});
app.post(
  "/addDepartureFlight",
  body("DepartureDate").isAfter(new Date().toString()),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    var FC, AN, DT, DD, to, Duration, AL, FT, LT, NS;
    FT = req.body.Flighttype;
    NS = req.body.noofstops;
    AL = req.body.Airline;
    FC = req.body.FlightCode;
    AN = req.body.Airline;
    DT = req.body.DepartureTime;
    DD = req.body.DepartureDate;
    to = req.body.to;
    LT = req.body.layover;
    Duration = req.body.Duration;
    DD.replace("T", " ");
    var sql = `select AIRLINE_ID from airline where AL_NAME = "${AL}"`;
    con.query(sql, function (err, result) {
      if (err) {
        throw err;
      }
      var values = [
        [
          FC,
          AN,
          null,
          to,
          null,
          DD + " " + DT,
          Duration,
          "Departure",
          FT,
          result[0].AIRLINE_ID,
        ],
      ];
      sql = "insert into flight values ?";
      con.query(sql, [values], function (err) {
        if (err) {
          throw err;
        }
        var sql2;
        if (FT === "Connecting")
          sql2 = `insert into connecting values("${FC}","${LT}",${NS})`;
        else sql2 = `insert into nonstop values("${FC}")`;
        con.query(sql2, function (err) {
          if (err) throw err;
          console.log("values inserted");
          res.redirect("/addDepartureFlight");
        });
      });
    });
  }
);

app.post("/deletedeparture", (req, res) => {
  var FC = req.body.FC;
  var sqlq = `delete from flight where FlightCode="${FC}"`;
  con.query(sqlq, function (err, result) {
    if (err) {
      throw err;
    }
    console.log("value deleted");
    res.redirect("/Departure");
  });
});

app.get("/Arrival", (req, res) => {
  var isadmin = handler.validateToken(req, res).pass;
  var sql =
    "SELECT FlightCode,Airline,Source,DATE_FORMAT(Arrival,'%d %m %y') as ArrivalDate,TIME_FORMAT(Arrival,'%h:%i %p') as ArrivalTime from FLIGHT where Status='Arrival'";
  con.query(sql, function (err, data, fields) {
    if (err) throw err;
    if (isadmin === "admin") data.isadmin = "yes";
    else data.isadmin === "no";
    res.render("Arrival", { title: "Arrival", ArrivalData: data });
  });
});
app.get("/Departure", (req, res) => {
  var isadmin = handler.validateToken(req, res).pass;
  var sql = `SELECT FlightCode,Airline,Destination,DATE_FORMAT(Departure,"%d-%m-%y") as DepartureDate,TIME_FORMAT(Departure,'%h:%i %p') as DepartureTime,FlightType from FLIGHT where Status="Departure"`;
  con.query(sql, function (err, data, fields) {
    if (err) throw err;
    if (isadmin === "admin") data.isadmin = "yes";
    else data.isadmin === "no";
    if (data.length > 0) {
      sql = `SELECT layover_time as LT,no_of_stops as NS from connecting where FlightCode="${data[0].FlightCode}"`;
      con.query(sql, function (err, subdata, fields) {
        if (err) throw err;
        if (subdata.length === 0) {
        } else {
          data[0].LT = subdata[0].LT;
          data[0].NS = subdata[0].NS;
        }
        res.render("Departure", { title: "Departure", DepartureData: data });
      });
    } else res.render("Departure", { title: "Departure", DepartureData: data });
  });
});

app.get("/homeUser", (req, res) => {
  res.sendFile(absolutepathofhtml + "passenger/homeUser.html");
});
app.get("/booking", (req, res) => {
  res.sendFile(absolutepathofhtml + "/passenger/booking.html");
});

async function calcprice(Destination, Class) {
  var Price;
  switch (Destination) {
    case "New York":
      Price = 226;
      break;
    case "Paris":
      Price = 160;
      break;
    case "London":
      Price = 533;
      break;
  }
  if (Class === "Business") Price = 1.5 * Price;

  return Price;
}
async function executequeryt(UserID, PASS) {
  var sql1 = globalrequest.sql;
  var PID = globalrequest.PID;
  var TN = globalrequest.TN;
  var FC = globalrequest.FC;
  var DOBooking = globalrequest.DOBooking;
  var DOT = globalrequest.DOT;
  var SeatNo = globalrequest.SeatNo;
  var Class = globalrequest.Class;
  var TOT = globalrequest.TOT;
  var Source = globalrequest.Source;
  var Destination = globalrequest.Destination;
  var Price;
  sql1 =
    "insert into ticket (PID,Ticket_Number,Date_of_booking,Date_of_travel,Date_of_cancellation,SeatNo,Class,Source,Destination) values ?";

  values = [
    [PID, TN, DOBooking, DOT, null, SeatNo, Class, Source, Destination],
  ];

  con.query(sql1, [values], function (err, result) {
    if (err) {
      throw err;
    }
  });

  Price = await calcprice(Destination, Class);

  con.query(
    `insert into carries values(${PID}, "${FC}");insert into books values("${DOBooking}","${Source}","${Destination}","${Class}",${Price});update logindata set money=money-${Price} where userid="${UserID}" and  Pass=(select sha2("${PASS}",512));update logindata set money=money+${Price} where userid="admin"`,
    function (err, result) {
      if (err) {
        throw err;
      }
    }
  );
}

app.post(
  "/booking",
  body("SeatNo").isFloat({ min: 1, max: 450 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    var PID, FC, Class, TN, DOBooking, DOT, SeatNo, TOT;
    PID = req.body.PID;

    FC = req.body.FlightCode;
    var sql6 = `select Source,Destination from Flight where FlightCode="${FC}"`;
    con.query(sql6, function (err, result) {
      var Source = result[0].Source;
      var Destination = result[0].Destination;
      Class = req.body.class;
      var date = new Date();
      var day = ("0" + date.getDate()).slice(-2);
      var month = ("0" + (date.getMonth() + 1)).slice(-2);
      var year = date.getFullYear();
      DOBooking = year + "-" + month + "-" + day;
      DOT = req.body.DDate;
      DOT = DOT.replace("T", " ");
      TOT = req.body.Dtime;
      SeatNo = req.body.SeatNo;

      sql6 = "select * from ticket";
      con.query(sql6, async function (err, result, fields) {
        if (err) {
        }
        var i;
        //console.log(result,result.length  );

        TN = await getRndInteger(1, 9999);

        for (i = 0; i < result.length; i++) {
          if (TN === result[i].Ticket_Number || TN === 0) {
            TN = await getRndInteger(1, 9999);
            i = -1;
            continue;
          } else {
          }
        }
        console.log("TN final = ", TN);
        globalrequest = {
          sql: sql6,
          PID: PID,
          TN: TN,
          FC: FC,
          DOBooking: DOBooking,
          DOT: DOT,
          SeatNo: SeatNo,
          Class: Class,
          TOT: TOT,
          Source: Source,
          Destination: Destination,
        };
      });
    });

    res.redirect("/payment");
    //  res.redirect("/homeUser");
  }
);
app.get("/payment", async (req, res) => {
  var Price;
  Price = await calcprice(globalrequest.Destination, globalrequest.Class);
  globalrequest.Price = Price;
  Pricedata = [{ Price: Price }];
  console.log(JSON.stringify(smashingCoin, null, 4));
  res.render("payment", { title: "Payment", PriceData: Pricedata });
});

app.post("/payment", async (req, res) => {
  var pass = req.body.pass;
  var userid = req.body.userid;
  await executequeryt(userid, pass);
  var date_ob = new Date();
  var day = ("0" + date_ob.getDate()).slice(-2);
  var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  var year = date_ob.getFullYear();

  var date = year + "-" + month + "-" + day;

  var hours = date_ob.getHours();
  var minutes = date_ob.getMinutes();
  var seconds = date_ob.getSeconds();

  var dateTime =
    year +
    "-" +
    month +
    "-" +
    day +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;

  smashingCoin.addNewBlock(
    new blockcrypto.CryptoBlock(blockid, dateTime, {
      sender: userid,
      recipient: "admin",
      quantity: globalrequest.Price,
    })
  );
  blockid++;

  console.log(JSON.stringify(smashingCoin, null, 4));
  res.redirect("/ticketDetails");
});

app.get("/ticketDetails", (req, res) => {
  res.sendFile(absolutepathofhtml + "/passenger/ticketDetails.html");
});
app.post("/ticketDetails", (req, res) => {
  var sql = `select Ticket_Number,Destination,Class,SeatNo,DATE_FORMAT(Date_of_booking,"%d-%m-%y") as DOBOOK,DATE_FORMAT(Date_of_travel,"%d %m %y") as DOT,(select Flightcode from carries where pid=${req.body.PIDT}) as FC,(select TIME_FORMAT(Departure,"%r") from flight where flightcode=(select flightcode from carries where PID=${req.body.PIDT})) as DepartureTime from ticket where PID=${req.body.PIDT} AND Date_of_cancellation is null`;
  con.query(sql, async function (err, data) {
    if (err) {
      throw err;
    }
    if (data.length === 0) {
      res.render("ticketDetails.ejs", { title: "Ticket", TicketData: [] });
    } else if (data[0].FC === null) {
      var sqlq;
      sqlq = `update ticket set Date_of_cancellation= CURDATE() where Ticket_Number=${data[0].Ticket_Number};insert into cancels values(CURDATE(),50,(select PID from ticket where Ticket_Number= ${data[0].Ticket_Number}))`;
      con.query(sqlq, function (err) {
        if (err) {
        }
        console.log("ticket deleted");
      });
      res.render("ticketDetails", { title: "Ticket", TicketData: [] });
    }
    sql = `select Price from books where Date_of_booking=(select DATE(Date_of_booking) from ticket where pid=${req.body.PIDT}) and Destination= "${data[0].Destination}" and Class= "${data[0].Class}"`;
    con.query(sql, function (err, Pricedata) {
      if (err) {
        throw err;
      }
      console.log(Pricedata);
      data[0].Price = Pricedata[0].Price;
      console.log(data[0].Price);
      res.render("ticketDetails", { title: "Ticket", TicketData: data });
    });
  });
});

app.post("/deleteticket", (req, res) => {
  var TN = req.body.TN;
  console.log(TN);
  var sqlq;
  sqlq = `update ticket set Date_of_cancellation= CURDATE() where Ticket_Number=${TN};insert into cancels values(CURDATE(),50,(select PID from ticket where Ticket_Number= ${TN}))`;
  //sqlq = `delete from ticket where Ticket_Number=${TN}`;
  con.query(sqlq, function (err) {
    if (err) {
    }
    console.log("ticket deleted");
    res.redirect("/ticketDetails");
  });
});
app.post("/passengerdetails", (req, res) => {
  var pid = req.body.formpid;
  var sql;
  sql = `select *,(select pid from passenger1 where pid=${pid}) as PID from passenger2 where passportno= (select passportno from passenger1 where pid=${pid})`;
  con.query(sql, function (err, data) {
    if (err) {
    }
    res.render("passengerdetails", {
      title: "passengerdetails",
      PassengerData: data,
    });
  });
});
app.get("/passengerdetails", (req, res) => {
  res.sendFile(absolutepathofhtml + "/passenger/passengerdetails.html");
});
app.get("/addpassengerdetails", (req, res) => {
  res.sendFile(absolutepathofhtml + "/passenger/addpassengerdetails.html");
});

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var pid;
function executequery(
  sql,
  pid,
  Fname,
  Mname,
  Lname,
  Age,
  Sex,
  Phone,
  Passport,
  Address
) {
  sql = `insert into passenger1 values(${pid},"${Passport}")`;

  con.query(sql, function (err, result, fields) {
    if (err) {
    }
    console.log("values inserted");
  });
  values = [[Passport, Fname, Mname, Lname, Address, Phone, Sex, Age]];
  sql = "insert into passenger2 values ?";
  con.query(sql, [values], function (err, result, fields) {
    if (err) {
    }
    console.log("values inserted");
  });
}
app.post(
  "/addpassengerdetails",
  body("PhoneNo").isLength({ min: 10, max: 10 }),
  body("Age").isNumeric({ min: 0, max: 100 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    var sql;
    var Fname, Mname, Lname, Age, Sex, Phone, Passport, Address;
    Fname = req.body.Fname;
    Mname = req.body.Mname;
    Lname = req.body.Lname;
    Age = req.body.Age;
    Sex = req.body.Gender;
    Phone = req.body.PhoneNo;
    Passport = req.body.PassportNo;
    Address = req.body.Address;
    sql = "select * from passenger1";
    con.query(sql, function (err, result, fields) {
      if (err) {
      }
      var i;
      //console.log(result,result.length  );

      pid = getRndInteger(1, 1000);

      for (i = 0; i < result.length; i++) {
        if (pid === result[i].PID || pid === 0) {
          pid = getRndInteger(1, 1000);
          i = -1;
          continue;
        } else {
        }
      }
      console.log("PID final = ", pid);
      executequery(
        sql,
        pid,
        Fname,
        Mname,
        Lname,
        Age,
        Sex,
        Phone,
        Passport,
        Address
      );
    });

    res.redirect("/addpassengerdetails");
  }
);

app.get("/getpid", (req, res) => {
  res.send(
    `your pid is ${pid} , Please note it down, it will only appear this once`
  );
});
//login

app.post("/", (req, res) => {
  if (req.body.formName === "register") {
    body("email").isEmail();
  }
  body("userid").isAlphanumeric();
  body("pass").isStrongPassword();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  var UserID, PASS, sql;
  UserID = req.body.userid;
  PASS = req.body.pass;

  if (req.body.formName === "login") {
    sql = `SELECT UserID,Pass,Type FROM LOGINDATA WHERE UserID="${UserID}" AND Pass=(select sha2("${PASS}",512))`;
    con.query(sql, function (err, result, fields) {
      if (err) {
      }
      handler.generateToken(req, res);
      if (result.length === 0) {
        res.send("wrong username or password");
      } else if (result[0].Type === "admin") {
    
        res.redirect("/Adminhome");
      } else {
        res.redirect("/homeUser");
      }
      console.log("login done");
    });
  } else {
    var email = req.body.email;
    sql = `insert into logindata values("${UserID}",(select sha2("${PASS}",512)),"user","${email}")`;
    con.query(sql, function (err) {
      console.log("values inserted");
      res.redirect("/");
    });
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

//TEST AREA
var handler = require("./jwthandler");

httpsServer.listen(8443);

console.log("Server listening https on port 8443");
