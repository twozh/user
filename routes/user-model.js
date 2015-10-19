var mongoose = require('mongoose');
var hash= require('simple-hash');
var Schema = mongoose.Schema;

/* user's email should be unique, there is logic to do unique check */
var userSchema = new Schema({
	hash		: {type: String, required: true},
	salt		: {type: String, required: true},
	email		: {type: String, required: true},
	registerTime: {type: Date, default: Date.now, required: true},
	name		: {type: String},		
	group		: {type: String, enum: ['super', 'admin', 'normal'], default: 'normal'},
	findStartTime: {type: Date},
});

userSchema.statics.create = function(obj, cb){
	/* user'name unique check */
	this.findOne({email: obj.email}, function(err, user){
		if (user !== null){
			cb(new Error('Email is already exist！'));
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
				cb(null, newUser);
			});
		});
	});
};

userSchema.statics.auth = function (email, pass, cb) {
	this.findOne({email: email}, function(err, user){
		if (err){
			return cb(err);
		}
		if (user === null){
			return cb(new Error('Email is not exist！'));
		}
		hash.hash2(pass, user.salt, function(err, hash){
			if (hash === user.hash){
				cb(null, user);
			}
			else {
				cb(new Error('Password is not correct！'));
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
