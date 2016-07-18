//requires...
	var bodyParser=require('body-parser');
	var express = require('express');
	var mongoose= require('mongoose');
	var app = express();
	var sessions = require('client-sessions');
	var bcrypt=require('bcryptjs');

//mongo.....
	var Schema=mongoose.Schema;
	var ObjectId=Schema.ObjectId;
	var User = mongoose.model('User',new Schema({
		id: ObjectId,
		firstName: String,
		lastName: String,
		email: {type: String,unique: true},
		password: String,
	}));
	mongoose.connect('mongodb://localhost/newauth');

//views...
	app.set('view engine','jade');
	app.set('views', __dirname + '/views');

//Middleware!/....
	app.use(bodyParser.urlencoded({extended:true}));
	app.use(sessions({
		cookieName : 'session',
		secret: 'safjhbvdsjkfguweryiioewurfhjh7369832',
		duration: 30*60*1000,
		active: 5*60*1000,

	}));
//routes...
	app.get('/',function (req,res){
		var title = 'Home';
		res.render('index.jade',{title})
	});


	app.get('/register',function (req,res){
		var title = 'Register';
		res.render('register.jade',{title})
	});


	app.post('/register',function (req,res){
		//res.json(req.body);
		var hash = bcrypt.hashSync(req.body.Password,bcrypt.genSaltSync(10));
		var user = new User({
			firstName: req.body.FirstName,
			lastName: req.body.LastName,
			email: req.body.Email,
			password: hash,
		});
		user.save(function(err){
			if(err){
				var error="Something bad happend try again!";
				if(err.code===11000){
					error="Email already taken! Try another!";
				}
				//console.dir(err);
				res.render('register.jade',{error: error});
			}
			else
			{
				res.redirect('/dashboard');
			}
			
		})
	});


	app.get('/login',function (req,res){
		var title = 'Login';
		res.render('login.jade',{title})
	});

	app.post('/login',function (req,res){
		User.findOne({ email: req.body.Email },function(err,user){
			if(!user){
				res.render('login.jade',{error:'Invalid username or password!'});
			}else{
				if(bcrypt.compareSync(req.body.password,user.password)){
					req.session.user=user; //set cookie ={email: ,password:};
					res.redirect('/dashboard');
				}else{
					res.render('login.jade',{error:'Invalid username or password cocky'});
				}
			}
		});
	});

	app.get('/dashboard',function (req,res){
		var title = 'Dashboard';
		if(req.session && req.session.user){
			User.findOne({ email: req.session.user.email},function (err,user){
				if(!user){
					req.session.reset();
					res.redirect('/login');
				}else{
					res.locals.user = user;
					res.render('dashboard.jade',{title});
				}
			})
		}else{
			res.redirect('/login');
		}
		//res.render('dashboard.jade',{title})
	});


	app.get('/logout',function (req,res){
		req.session.reset();
		res.redirect('/');
	});

	app.listen(3000, function() {
		console.log("The frontend server is running on port 3000!");
	});