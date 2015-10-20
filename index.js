/* the interface used by app */

/* interactive logic */
exports.route = require('./routes/user-route.js');

/* core api like CRUD */
exports.apiRoute = require('./routes/user-route-api.js');

/* export User modle */
exports.User = require('./routes/user-model.js');
