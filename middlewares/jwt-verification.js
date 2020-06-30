const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try{
        let token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, 'this_is_very_secret');
        
        next();
    }catch (error){
        res.status(404).json({
            message: 'User not authorized.'
        })
    }

   
};