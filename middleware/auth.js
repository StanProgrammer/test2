const jwt = require('jsonwebtoken');
const User = require('../models/users');
const SECRET_KEY = 'ATIBAPI'
exports.auth = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        const user = jwt.verify(token, SECRET_KEY);
        User.findByPk(user.id).then((user) => {
            req.user = user
            next();
        });
    } catch (err) {
        console.log(err);
        return res.status(401).json({ success: false });
    }
};

