const { User } = require('./../models/user');

const authenticate = (req, res, next) => {
    const token = req.header('x-auth');

    User.findByToken(token).then(
        user => {
            if(!user)
                return Promise.reject("No user found");
            req.user = user;
            req.token = token;
            next();
        }
    )
    .catch(
        error => {
            res.status(401).send();
        }
    );
};

module.exports = {
    authenticate
};