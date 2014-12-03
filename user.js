var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var hash= require('simple-hash');
var Schema = mongoose.Schema;
/************************************************
	model - User
*************************************************/
/* user's name should be unique, there is logic to do unique check */
var userSchema = new Schema({
	name		: {type: String, required: true},
	hash		: {type: String, required: true},
	salt		: {type: String, required: true},
	email		: {type: String, required: true},
	registerTime: {type: Date, default: Date.now, required: true},
	group		: {type: String, enum: ['admin', 'not-admin'], default: 'not-admin'},
});

userSchema.statics.create = function(obj, cb){
	/* user'name unique check */
	this.findOne({name: obj.name}, function(err, user){
		if (user !== null){
			cb(new Error('用户名已存在！'));
			return;
		}
		hash.hash(obj.pass, function(err, salt, hash){
			if (err) {
				cb(new Error('hash error'));
				return;
			}
			obj.salt = salt;
			obj.hash = hash;
			var newUser = new User(obj);
			newUser.save(function(err){
				if (err) {
					cb(new Error('new user save error'));
					return;
				}
				cb(null, {status: 'succ', msg: 'create user succ!'});
			});
		});
	});
};

userSchema.statics.auth = function (name, pass, cb) {
	this.findOne({name: name}, function(err, user){
		if (err){
			return cb(err);
		}
		if (user === null){
			return cb(new Error("Username dose not exist!"));
		}
		hash.hash2(pass, user.salt, function(err, hash){
			if (hash === user.hash){
				cb(null, user._id);
			}
			else {
				cb(new Error("Password is incorrect !"));
			}
		});
	});
};

var User = mongoose.model('User', userSchema);


/************************************************
	route and control
*************************************************/
var login = function(req, res) {	
	res.render('user/login');
};

var loginPost = function(req,res){
	console.log(req.body);
	User.auth(req.body.name, req.body.pass, function(err, userid){
		if (err){
			return res.send({status: "err", msg: err.message});
		}

		//return res.send({status: "succ", msg: "Login OK! Welcom!"});

		req.session.regenerate(function(){
			req.session.userid = userid;
			req.session.username = req.body.name;
			req.session.auth = true;
			return res.send({status: "succ", msg: "Login OK! Welcom!"});
	    });
	});
};

var signup = function(req, res) {
	res.render('user/signup');
};

var signupPost = function(req, res){
	var email = req.body.email;
	var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	if (!regex.test(email)){
		return res.status(403).send("Email格式不正确！");
	}

	User.create(req.body, function(err, user){
		if (err){
			return res.status(403).send(err.message);
		}
		res.send("Success");
	});
};

var nameDupCheck = function(req, res){
	if (!req.body.name){
		return res.status(403).send("用户名不能为空");
	}

	User.findOne({name: req.body.name}, function(err, user){
		if (err)
			return res.status(403).send(err.msg);
		if (user)
			return res.status(403).send("用户名已存在！");
		return res.send("OK");
	});
}

var emailDupCheck = function(req, res){
	if (!req.body.email){
		return res.status(403).send("E-mail不能为空");
	}

	User.findOne({email: req.body.email}, function(err, user){
		if (err)
			return res.status(403).send(err.msg);
		if (user)
			return res.status(403).send("E-mail已存在！");
		return res.send("OK");
	});
}


router.get('/', 		login);
router.get('/login', 	login);
router.get('/signup', 	signup);
router.post('/login', 	loginPost);
router.post('/signup', 	signupPost);

router.post('/nameDupCheck', 	nameDupCheck);
router.post('/emailDupCheck', 	emailDupCheck);


module.exports = router;
