/*
	user session provide:
	req.session.auth
	req.session.username
	req.session.userid
 */
exports.route = require('./routes/user-route.js');
exports.apiRoute = require('./routes/user-route-api.js');

exports.loginPath = "/user/login";

exports.User = require('./routes/user-model.js');

