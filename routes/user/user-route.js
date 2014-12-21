var express = require('express');
var router = express.Router();
var User = require('./user-model.js');
var nodemailer = require('nodemailer');
//var smtpTransport = require('nodemailer-smtp-transport');

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
	res.render('user/login');
};

var loginPost = function(req, res){
	User.auth(req.body.name, req.body.pass, function(err, userid){
		if (err){
			return res.status(403).send(err.message);
		}

		req.session.regenerate(function(){
			req.session.userid = userid;
			req.session.username = req.body.name;
			req.session.auth = true;
			return res.send("Login OK! Welcom!");
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
};

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
};

var admin = function(req, res){
	if (req.session.auth !== true){
		return res.render('user/admin-warning');
	}

	res.render('user/admin');
};

var sendmailPost = function(req, res){
	User.findOne({email: req.body.email}, function(err, user){
		if (err)
			return res.status(403).send(err.msg);
		if (!user)
			return res.status(403).send("E-mail dose not exist！");

		// setup e-mail data with unicode symbols
		var mailOptions = {
		    from: 'User Center <ceo@jiansoft.net>', // sender address
		    to: req.body.email, // list of receivers
		    subject: 'Change password', // Subject line
		    text: 'Hello world ✔', // plaintext body
		    html: "<a href=http://localhost:3000/changepasswd/" + user._id + ">Change password ✔</a>" // html body
		};

		// send mail with defined transport object
		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        console.log(error);
		    }else{
		        console.log('Message sent: ' + info.response);
		        user.isInFindState = true;
				user.findStartTime = Date.now();
		        user.save(function(err, user){
					if (err)
						return res.status(403).send(err.msg);
					return res.send("OK");
				});		
		    }
		});		
	});
};

var userRetrieveUsers = function(req, res){	
	User.find({}, 'name email registerTime group', function(err, users){
		if (err){
			return res.status(403).send(err.msg);
		}
		console.log("users length:", users.length);

		res.send(users);
	});
};

var userUpdateUser = function(req, res){
	User.findByIdAndUpdate(req.params.id, 
		req.body, 
		{select: 'name email registerTime group'}, 
		function(err, user){
			if (err){
				console.log(err);
				return res.status(403).send(err.message);
			}

			res.send(user);
		}
	);
};

var userCenter = function(req, res){
	if (req.session.auth !== true){
		return res.redirect('/login');
	}

	var render = {
		name: req.session.username,
	};

	res.render('user/center', render);
};

var changePasswd = function(req, res){
	if (req.session.auth !== true){
		return res.status(403).send('not login');
	}
	
	console.log(req.body);

	User.changePasswd(req.session.userid, req.body.newpasswd, function(err, user){
		if (err){
			return res.status(403).send(err.message);
		}

		res.send('change passwd ok!');
	});
};

var findPasswd = function(req, res){
	res.render('user/findpasswd');
};

var changePasswdByFind = function(req, res){
	User.findById(req.params.id, function(err, user){
		if (user.isInFindState === false){
			return res.status(404).send('unavailable');
		}

		res.render('user/changepasswd', {id: req.params.id});
	});	
};

var changePasswdByFindPost = function(req, res){
	User.changePasswd(req.params.id, req.body.newpasswd, function(err, user){
		if (err){
			return res.status(403).send(err.message);
		}

		res.send('change passwd ok!');
	});
}

router.get('/', 				login);
router.get('/login', 			login);
router.get('/signup', 			signup);
router.post('/login', 			loginPost);
router.post('/signup', 			signupPost);
router.post('/nameDupCheck', 	nameDupCheck);
router.post('/emailDupCheck', 	emailDupCheck);

router.post('/sendmail', 		sendmailPost);

//user admin
router.get('/admin',			admin);

//CRUD-users
router.get('/user/users',		userRetrieveUsers);
router.patch('/user/users/:id',	userUpdateUser);

//user center
router.get('/i', userCenter);
router.post('/changepasswd', changePasswd);
router.get('/findpasswd', findPasswd);

router.get('/changepasswd/:id', changePasswdByFind);
router.post('/changepasswd/:id', changePasswdByFindPost);

module.exports = router;
