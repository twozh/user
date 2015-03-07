var express = require('express');
var router = express.Router();
var User = require('./user-model.js');

var apiNameDupCheck = function(req, res){
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

var apiEmailDupCheck = function(req, res){
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

var apiUserRetrieveUsers = function(req, res){	
	User.find({}, 'name email registerTime group', function(err, users){
		if (err){
			return res.status(403).send(err.msg);
		}

		res.send(users);
	});
};

var apiUserUpdateUser = function(req, res){
	User.findByIdAndUpdate(req.params.id, 
		req.body, 
		{select: 'name email registerTime group'}, 
		function(err, user){
			if (err){
				return res.status(403).send(err.message);
			}

			res.send(user);
		}
	);
};

var apiUserDeleteUser = function(req, res){
	User.findByIdAndRemove(req.params.id,
		{select: 'name email registerTime group'}, 
		function(err, user){
			if (err){
				return res.status(403).send(err.message);
			}

			res.send(user);
		}
	);
};

var apiChangePasswdByFind = function(req, res){
	User.changePasswd(req.params.id, req.body.newpasswd, function(err, user){
		if (err){
			return res.status(403).send(err.message);
		}

		res.send('change passwd ok!');
	});
};

router.post('/nameDupCheck', 	apiNameDupCheck);
router.post('/emailDupCheck',	apiEmailDupCheck);
router.post('/changepasswd/:id', 	apiChangePasswdByFind);
//CRUD-users
router.get('/users',		apiUserRetrieveUsers);
router.patch('/users/:id',	apiUserUpdateUser);
router.delete('/users/:id',	apiUserDeleteUser);

module.exports = router;
