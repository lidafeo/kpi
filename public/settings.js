$(document).ready(function() {
    $('#form-edit-pass').submit(function (e) {
        if($("#password1").val() != $("#password2").val()) {
            e.preventDefault();
            $("#error").html("Пароли не совпадают");
        }
    });
});