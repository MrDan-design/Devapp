const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({ message: "No token provided"});
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // attach user info to rquest object
        next(); // pass control to the next function
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token'});
    }
};

//console.log("Token received:", token);
//console.log("Decoded:", jwt.decode(token));

module.exports = verifyToken;