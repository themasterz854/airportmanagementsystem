const jwtExpirySeconds = 60 * 10;
var jwt = require('jsonwebtoken');
function generateToken(req, res) {
    // Validate User Here
    // Then generate JWT Token
    var userid = req.body.userid;
    var pass = req.body.pass;
    //var email = req.body.email;

    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let data = {
        userid: userid,
        pass: pass,
        //email: email,
    };

    const token = jwt.sign(data, jwtSecretKey, {
        algorithm: "HS256",
        expiresIn: jwtExpirySeconds,
    });

    res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 });
    
};

function validateToken(req, res) {
   
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    try {

        const token = req.cookies.token;
        if(token == undefined)
        {
            return false;
        }
        const verified = jwt.verify(token, jwtSecretKey);
        if (verified) {
            return verified;
        }
        
    } catch (error) {
        // Access Denied
        console.log("error");
        return res.status(401).send(error);
    }
};
module.exports = {generateToken,validateToken};