const User = require('../../models/user')
const UserService = require('./userService')
const passport = require('passport');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const currentUser = await User.findOne({ id });
    done(null, currentUser);
});

module.exports = UserService(User)