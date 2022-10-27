const express = require('express');
const router = express.Router();
const passport = require('passport');
//const GoogleStrategy = require('passport-google-oidc');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserService = require('../src/user/index');

router.get('/login', function(req, res, next) {
    //res.render('login');
    console.log('Here will be rendering login page')
    res.end('Here will be rendering login page')
});

router.get('/login/federated/google', passport.authenticate('google'));

router.get("/logout", (req, res) => {
    //req.flash("success", "Successfully logged out");
    req.session.destroy(function () {
        res.clearCookie("connect.sid");
        res.redirect("/");
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/oauth2/redirect/google',
    scope: [ 'profile', 'email' ]
}, async (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    const id = profile.id;
    const email = profile.emails[0].value;
    const firstName = profile.name.givenName;
    const lastName = profile.name.familyName;
    //const profilePhoto = profile.photos[0].value;
    //const source = "google";

    const currentUser = await UserService.getUserByEmail({ email });
    if (!currentUser) {
        const newUser = await UserService.addGoogleUser({
            id,
            email,
            firstName,
            lastName,
        })
        return done(null, newUser);
    }

    if (currentUser.source !== "google") {
        //return error
        return done(null, false, { message: `You have previously signed up with a different signin method` });
    }

    currentUser.lastVisited = new Date();
    return done(null, currentUser);
}));

module.exports = router;