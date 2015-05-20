var express = require('express'),
    bodyParser = require('body-parser'),
    db = require("./models"), // require the models for db
    session = require("express-session"),
    app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: 'super secret',
    resave: false,
    saveUninitialized: true
}));

var path = require("path");
var views = path.join(process.cwd(), "views");

app.use("/", function(req, res, next) {

    // logs in a user by saving their
    // userId
    req.login = function(user) {
        // user `{email: "jane@g.com, _id: ASF"}
        // setting user's seesion to store their _id
        req.session.userId = user._id;
    };
    // fetches the user associated with the current session
    req.currentUser = function(cb) {
        db.User.
        findOne({
                _id: req.session.userId
            },
            function(err, user) {
                req.user = user;
                cb(null, user);
            })
    };
    // 
    req.logout = function() {
        req.session.userId = null;
        req.user = null;
    }

    next();
});

// have same template as login
app.get("/signup", function(req, res) {
    res.sendFile(path.join(views, "signup.html"));
});

// add unique user to database
app.post("/signup", function(req, res) {
    var user = req.body.user;
    console.log(req.body.user);
    db.User.
    createSecure(user.email, user.password,
        function() {
            res.redirect("/login");
        });
});

// // where the user submits the sign-up form
// app.post("/users", function(req, res) {

//     // grab the user from the params
//     var user = req.body.user;

//     // create the new user
//     db.User.
//     createSecure(user.email, user.password,
//         function() {
//             res.send("SIGNED UP!");
//         });
// });

// we will type in user, password and email into
// a form then post it to this route to login
app.post("/login", function(req, res) {
    var user = req.body.user;

    db.User
        .authenticate(user.email, user.password,
            function(err, user) {
                console.log("LOGGING IN!");
                req.login(user);
                res.redirect("/profile");
            });
});

app.get("/profile", function(req, res) {
    req.currentUser(function(err, user) {
        res.send("Welcome " + user.email)
    });
});

app.get("/login", function(req, res) {
    res.sendFile(path.join(views, "login.html"));

});

app.listen(3000, function() {
    console.log("SERVER RUNNING");
});