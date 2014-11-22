var my_prj = {

signup: function(event){
	$(".has-error").removeClass("has-error");
	$(".form-signin").find("p").remove();

	if ($('#iPass').val().length < 3 || $('#iPass').val() != $('#iPass2').val()){
		$('.pass').addClass('has-error');
		$('#msg').clone().html("密码需要一致并且长度要大于3")
			.appendTo($('#iPass2').parent());
	}
	else{
		var data = {
			name: $('#iName').val(),
			email: $('#iEmail').val(),
			pass: $('#iPass').val()
		};
		$.post("/signup", data, function(ret){
			console.log(ret);
			if (ret.status === 'err'){
				$('#msg').clone().html(ret.msg)
					.appendTo($('#iPass2').parent());
			} else{
				location.href = '/login';
			}
		}).fail(function(){
			alert( "Sorry, there was a problem!" );
		});
	}
	return false;
},

signin: function (event){
	$(".has-error").removeClass("has-error");
	$(".form-signin").find("p").remove();

	if ($('#iPass').val().length < 3){
		$('#iPass').parent().addClass('has-error');
		$('#msg').clone().html("Password's length should longer than 3")
			.appendTo($('#iPass').parent());
	}
	else{
		var data = {
			name: $('#iName').val(),
			pass: $('#iPass').val()
		};
		$.post("/login", data, function(ret){
			console.log(ret);
			if (ret.status === 'err'){
				$('#msg').clone().html(ret.msg)
					.appendTo($('#iPass').parent());
			} else {
				//location.href = '/' + data.name;
				console.log("login ok!");
			}
		}).fail(function(){
			alert( "Sorry, there was a problem!" );
		});
	}
	return false;
},
};

$(document).ready(function() {
	$("#form-signup").submit(my_prj.signup);
	$("#form-signin").submit(my_prj.signin);
});
