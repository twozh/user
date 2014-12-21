var my_prj = {

signin: function (event){
	if ($('#passwdLogin').val().length < 3){
		$('#msg').html("密码长度最小是3");
		return false;
	}

	var data = {
		name: $('#nameLogin').val(),
		pass: $('#passwdLogin').val()
	};

	$.post("/login", data, function(ret){
		//location.href = '/' + data.name;
		$('#msg').html(ret);
	}).fail(function(xhr, status, error){
		$('#msg').html(xhr.responseText);
	});

	return false;
},

signup: function(event){
	if ($('#name').data('error') || $('#email').data('error')){
		return false;
	}

	if ($('#passwd1').val().length < 6 || $('#passwd1').val() != $('#passwd2').val()){
		$('#passCheckMsg').html("密码需要一致并且最小长度是6");
		return false;
	}

	var data = {
		name: $('#name').val(),
		email: $('#email').val(),
		pass: $('#passwd1').val()
	};

	$.post("/signup", data, function(ret){
		$('#msg').html("注册成功，跳转到登陆后界面！");
		//location.href = '/login';	
	}).fail(function(xhr, status, error){
		$('#msg').html(xhr.responseText);
	});
	
	return false;
},

nameDuplicateCheck: function(){
	var v = $("#name").val();
	v = $.trim(v);

	if (!v) return;

	$.post("/nameDupCheck", {name: v}, function(ret){		
		$('#nameCheckMsg').html('');
		$('#name').data("error", false);
		$('#name').parent().removeClass('has-error');
	}).fail(function(xhr, status, error){
		$('#nameCheckMsg').html(xhr.responseText);
		$('#name').data("error", true);
		$('#name').parent().addClass('has-error');
	});
},

emailDuplicateCheck: function(){
	//var 
	var v = $("#email").val();
	v = $.trim(v);

	if (!v) return;
	var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	if (!regex.test(v)){
		$('#emailCheckMsg').html("Email格式不正确！");
		$('#email').data("error", true);
		$('#email').parent().addClass('has-error');
		return;
	}

	$('#emailCheckMsg').html("");
	$('#email').data("error", false);
	$('#email').parent().removeClass('has-error');

	$.post("/emailDupCheck", {email: v}, function(ret){		
		$('#emailCheckMsg').html('');
		$('#email').data("error", false);
		$('#email').parent().removeClass('has-error');
	}).fail(function(xhr, status, error){
		$('#emailCheckMsg').html(xhr.responseText);
		$('#email').data("error", true);
		$('#email').parent().addClass('has-error');
	});
},

resetPassClass: function(){
	$('#passCheckMsg').html("");
},

changePasswd: function(){
	var passwd = $('#newpasswd').val();
	passwd = $.trim(passwd);

	if (!passwd){
		return false;
	}

	var userid = $('#btnNewPasswd').attr('userid');
	var url;
	if (userid){
		url = '/changepasswd/' + userid;
	} else{
		url = '/changepasswd';
	}

	$.post(url, {newpasswd: passwd}, function(ret){
		console.log(ret);
	}).fail(function(xhr, status, error){
		console.log(xhr.responseText);
	});
},

findPasswd: function(){
	var v = $('#email').val();
	v = $.trim(v);

	if (!v) return;
	var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	if (!regex.test(v)){
		console.log("Email格式不正确！");
		return;
	}

	$.post("/sendmail", {email: v}, function(ret){
		console.log(ret);
	}).fail(function(xhr, status, error){
		console.log(xhr.responseText);
	});
},

};

$(document).ready(function() {
	$("#form-signup").submit(my_prj.signup);
	$("#form-signin").submit(my_prj.signin);
	$("#name").keyup(my_prj.nameDuplicateCheck);
	$("#email").keyup(my_prj.emailDuplicateCheck);
	$("#passwd1").keyup(my_prj.resetPassClass);
	$("#passwd2").keyup(my_prj.resetPassClass);
	$('#btnNewPasswd').click(my_prj.changePasswd);
	$('#btnFindPasswd').click(my_prj.findPasswd);
});
