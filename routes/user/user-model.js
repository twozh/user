var mongoose = require('mongoose');
var hash= require('simple-hash');
var Schema = mongoose.Schema;

/* user's name should be unique, there is logic to do unique check */
var userSchema = new Schema({
	name		: {type: String, required: true},
	hash		: {type: String, required: true},
	salt		: {type: String, required: true},
	email		: {type: String, required: true},
	registerTime: {type: Date, default: Date.now, required: true},
	group		: {type: String, enum: ['super', 'admin', 'normal'], default: 'normal'},
	isInFindState: {type: Boolean, default: false},
	findStartTime: {type: Date},	
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
			return cb(new Error("用户名已不存在！"));
		}
		hash.hash2(pass, user.salt, function(err, hash){
			if (hash === user.hash){
				cb(null, user._id);
			}
			else {
				cb(new Error("密码不正确！"));
			}
		});
	});
};

userSchema.statics.changePasswd = function(id, newpasswd, cb){
	hash.hash(newpasswd, function(err, salt, hash){
		if (err){
			return cb(err);
		}
		User.findByIdAndUpdate(id, {salt: salt, hash: hash}, function(err, user){
			if (err){
				return cb(err);				
			}
			if (null === user){
				return cb(new Error('user id dose not exist'));
			}

			cb(null, user);
		});
	});
};

var User = mongoose.model('User', userSchema);

module.exports = User;
