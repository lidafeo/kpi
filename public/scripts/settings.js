$(document).ready(function() {
    $('#form-edit-pass').submit(function (e) {
        if($("#password1").val() != $("#password2").val()) {
            e.preventDefault();
            $("#password1").addClass('is-invalid');
            $("#error").html("Пароли не совпадают");
        }
    });
});