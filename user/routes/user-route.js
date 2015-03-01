var express = require('express');
var router = express.Router();
var User = require('./user-model.js');
var nodemailer = require('nodemailer');
var gFindpassTimeout = 10*60*1000; //10min

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
	service: 'QQ',
	auth: {
		user: '375488770@qq.com',
		pass: 'coderushi2zh'
	}
});

/************************************************
	route and control
*************************************************/
var login = function(req, res) {
	var redirect = '';
	if (req.query.redirect){
		redirect = '?redirect=' + req.query.redirect;
	}
	
	res.render('login', {redirect: redirect});
};

var loginPost = function(req, res){
	console.log(req.body);
	console.log(req.query);
	var redirect='/i';

	if (req.query.redirect){
		redirect = req.query.redirect;
	}

	User.auth(req.body.name, req.body.pass, function(err, userid){
		if (err){
			return res.status(403).send(err.message);
		}

		req.session.regenerate(function(){
			req.session.userid = userid;
			req.session.username = req.body.name;
			req.session.auth = true;
			return res.redirect(redirect);
		});
	});
};

var logout = function(req, res){
	req.session.destroy(function(){

		return res.redirect("/");
	});
};

var signup = function(req, res) {
	res.render('signup');
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

		req.session.regenerate(function(){
			req.session.userid = user._id;
			req.session.username = req.body.name;
			req.session.auth = true;
			return res.redirect('/i');
		});
	});
};

var admin = function(req, res){
	if (req.session.auth !== true){
		return res.redirect('/login?redirect='+req.url);
	}

	User.findById(req.session.userid, function(err, user){
		if (err)
			return res.status(403).send(err.message);
	
		if (!user){
			console.log(req.session.userid);
			return res.status(403).send("user dosenot exist, refresh!");
		}

		if (user.group === 'super' || user.group === 'admin'){			
			return res.render('admin');
		} else{			
			return res.status(403).send("You have not admin previlege");
		}
	});	
};

var userCenter = function(req, res){
	if (req.session.auth !== true){
		return res.redirect('/login?redirect='+req.url);
	}

	var render = {
		name: req.session.username,
	};

	res.render('center', render);
};

var changePasswd = function(req, res){
	if (req.session.auth !== true){
		return res.status(403).send('not login');
	}
	
	User.changePasswd(req.session.userid, req.body.newpasswd, function(err, user){
		if (err){
			return res.status(403).send(err.message);
		}

		res.send('change passwd ok!');
	});
};


var findPasswd = function(req, res){
	res.render('findpasswd');
};

var findPasswdPost = function(req, res){
	User.findOne({email: req.body.email}, function(err, user){
		if (err)
			return res.status(403).send(err.message);
		if (!user)
			return res.status(403).send("E-mail dose not exist！");

		var now = Date.now();
		var diff = now - user.findStartTime;

		if (diff && diff < gFindpassTimeout){
			return res.status(404).send('has already post.');
		}

		// setup e-mail data with unicode symbols
		var mailOptions = {
			from: 'User Center <ceo@jiansoft.net>', // sender address
			to: req.body.email, // list of receivers
			subject: 'Change password', // Subject line
			text: 'Hello world ✔', // plaintext body
			html: "<a href=http://localhost:3000/i/changepasswd/" + user._id + ">Change password</a>" // html body
		};

		// send mail with defined transport object
		transporter.sendMail(mailOptions, function(error, info){
			if(error){
				console.log(error);
			}else{
				console.log('Message sent: ' + info.response);
				user.findStartTime = Date();
				user.save(function(err, user){
					if (err)
						return res.status(403).send(err.message);
					return res.send("Has sent an email to "+req.body.email);
				});		
			}
		});		
	});
};

var changePasswdByFind = function(req, res){

	User.findById(req.params.id, function(err, user){
		var now = Date.now();
		var diff = now - user.findStartTime;

		if (diff > gFindpassTimeout){
			//10min
			return res.status(404).send('unavailable or timeout');
		}

		res.render('changepasswd', {id: req.params.id});
	});	
};

var changePasswdByFindPost = function(req, res){
	User.findById(req.params.id, function(err, user){
		var now = Date.now();
		var diff = now - user.findStartTime;

		if (diff > gFindpassTimeout){
			return res.status(404).send('unavailable or timeout');
		}

		User.changePasswd(req.params.id, req.body.newpasswd, function(err, user){
			if (err){
				return res.status(403).send(err.message);
			}

			user.findStartTime = 0;

			user.save(function(err, user){
				if (err)
					return res.status(403).send(err.message);
				return res.send('change passwd ok!');
			});
		});		
	});	
};

router.get('/', 				login);
router.get('/login', 			login);
router.post('/login',			loginPost);
router.get('/logout', 			logout);
router.get('/signup', 			signup);
router.post('/signup', 			signupPost);
router.get('/admin',			admin);
router.get('/i', 				userCenter);
router.post('/i/changepasswd',	changePasswd);
router.get('/i/changepasswd/:id', changePasswdByFind);
router.post('/i/changepasswd/:id', changePasswdByFindPost);
router.get('/findpasswd', 		findPasswd);
router.post('/findpasswd', 		findPasswdPost);



module.exports = router;
