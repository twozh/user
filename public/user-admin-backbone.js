Backbone.emulateHTTP = true;

//User model
var User = Backbone.Model.extend({
	idAttribute: "_id",

	defaults: {
		name: '',
		email:  '',
		registerTime:  '',
		group: '',
	},
});

//User collection
var Users = Backbone.Collection.extend({
	model: User,
	url: '/user/api/users',
});

//User item view
var UserView = Backbone.View.extend({
	//tagName: "tr",
	template: _.template($('#item-template').html()),

	events: {
		'click #setAdmin'		: 'setAdmin',
		'click #dismissAdmin'	: 'dismissAdmin',
		'click #delUser'		: 'delUser',
	},

	initialize: function(){
		this.listenTo(this.model, 'destroy', 	this.remove);
		this.listenTo(this.model, 'change', 	this.render);
	},

	render: function(){
		var m = this.model.toJSON();
		this.$el.html(this.template(m));
		return this;
	},

	setAdmin: function(){
		this.model.save({group: 'admin'}, {
			error: function(){
					alert('服务器异常，请刷新！');
				},
			wait: true,
			patch: true,
		});
	},

	dismissAdmin: function(){
		this.model.save({group: 'normal'}, {
			error: function(){
					alert('服务器异常，请刷新！');
				},
			wait: true,
			patch: true,
		});
	},

	delUser: function(){
		var ret = confirm("Are you sure to delete ?");
		if (ret) {
			this.model.destroy({
				wait: true,

				error: function(){
						alert('服务器异常，请刷新！');
					},
			});
		}				
	},
});

//The App View
var UserAdminView = Backbone.View.extend({
	el: $('#userAdminApp'),

	events: {

	},

	initialize: function(){
		this.users = new Users();
		this.totalUsers = 0;

		//this.listenTo(this.users, 'add', 	this.renderModel);
		this.listenTo(this.users, 'reset', 	this.renderCollection);
		this.listenTo(this.users, 'remove', this.freshNonModelView);

		this.users.fetch({
			error: function(c, r, o){
				alert("fetch fail");
			},
			reset: true,
		});		
	},

	renderModel: function(user){
		var view = new UserView({model: user});
		this.$('#userList').prepend(view.render().el);
	},

	renderCollection: function(){
		this.freshNonModelView();
		this.$('#userList').empty();		
		if (this.users.length === 0) return;

		//temprary dom
		var t = $("<p></p>");

		this.users.each(function(user){
			var view = new UserView({model: user});
			t.append(view.render().el);
		});

		this.$('#userList').append(t.children());
	},

	freshNonModelView: function(){
		this.totalUsers = this.users.length;
		this.$('#totalUsers').html(this.totalUsers);
	},
});

var App = new UserAdminView();