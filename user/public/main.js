var my_prj = {

signin: function (event){
	if ($('#passwdLogin').val().length < 3){
		$('#msg').html("密码长度最小是3");
		return false;
	}
},

signup: function(event){
	if ($('#name').data('error') || $('#email').data('error')){
		return false;
	}

	if ($('#passwd1').val().length < 6 || $('#passwd1').val() != $('#passwd2').val()){
		$('#passCheckMsg').html("密码需要一致并且最小长度是6");
		return false;
	}
},

nameDuplicateCheck: function(){
	var v = $("#name").val();
	v = $.trim(v);

	if (!v) return;

	$.post("/api/user/nameDupCheck", {name: v}, function(ret){		
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

	$.post("/api/user/emailDupCheck", {email: v}, function(ret){		
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

findPasswd: function(){
	var v = $('#registerEmail').val();
	v = $.trim(v);

	if (!v) return false;
	var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	if (!regex.test(v)){
		console.log("Email格式不正确！");
		return false;
	}
},

};

$(document).ready(function() {
	$("#form-signup").submit(my_prj.signup);
	$("#form-signin").submit(my_prj.signin);
	$("#form-findpasswd").submit(my_prj.findPasswd);

	$("#name").keyup(my_prj.nameDuplicateCheck);
	$("#email").keyup(my_prj.emailDuplicateCheck);
	$("#passwd1").keyup(my_prj.resetPassClass);
	$("#passwd2").keyup(my_prj.resetPassClass);
});
