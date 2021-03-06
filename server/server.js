var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    mongoose = require('mongoose');


var morgan = require('morgan');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file

mongoose.Promise = global.Promise;
// Connection to DB
mongoose.connect(config.database, function(err, res) {
    if (err) throw err;
    console.log('Connected to Database');
});
app.set('superSecret', config.secret); // secret variable

// Middlewares
/*app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());*/

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(methodOverride());

// use morgan to log requests to the console
app.use(morgan('dev'));

// Import Models and controllers
var userMdl = require('./models/userModel')(app, mongoose);
var userCtrl = require('./controllers/userController');

app.use(express.static(__dirname + '/../webapp'));


//CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Access-Token");
    next();
});

// API routes ------------------------------------------------------
var apiRoutes = express.Router();

apiRoutes.route('/login')
    .post(userCtrl.login);
apiRoutes.route('/signup')
    .post(userCtrl.signup);
apiRoutes.route('/users')
    .get(userCtrl.getAllUsers);
apiRoutes.route('/users/id/:userid')
    .get(userCtrl.getUserById);

// OJU AQUÏ TREC la verificació de token temporalment, per fer les proves des de l'app
// route middleware to verify a token
apiRoutes.use(function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if (err) {
                return res.send(204,
                {
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                //console.log("decoded " + decoded);
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(204).send({
            success: false,
            message: 'No token provided.'
        });

    }
}); //fi verificació de token

apiRoutes.route('/users/token')
    .get(userCtrl.getUserByToken);
apiRoutes.route('/users')//agafa l'user a partir del token
    .put(userCtrl.updateUser)//no comprovat
    .delete(userCtrl.deleteUser);


app.use('/api', apiRoutes);
// end of API routes -------------------------------------

// Start server
app.listen(config.port, function() {
    console.log("Node server running on port" + config.port);
});
