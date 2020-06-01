const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader) {
        req.isAuth = false;
        return next();
    }
    let decoded;
    const token = authHeader.split(' ')[1];
    try {
        decoded = jwt.verify(token, "secret");
    } catch(error) {
        req.isAuth = false;
        return next();
    }
    if(!decoded) {
        req.isAuth = false;
        return next();
    }

    req.isAuth = true;
    req.userId = decoded.userId;
    next(); 
}