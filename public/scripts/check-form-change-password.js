$(document).ready(function() {
    function checkValidForm(form) {
        let check = true;
        if (form.checkValidity() === false) {
            check = false;
        }
        $("#password2").removeClass("is-invalid");
        $('#error').text("");
        if ($("#password1").val() != $("#password2").val()) {
            $("#password2").addClass("is-invalid");
            $('#error').text("Пароли не совпадают");
            let element = $("#password2")[0];
            element.setCustomValidity("Invalid field");
            check = false;
        }
        form.classList.add('was-validated');
        return check;
    }
    $("#password1, #password2").on("input", function (e) {
        if(!$('#form-edit-pass').hasClass('was-validated')) {
            return;
        }
        let element = $("#password2")[0];
        element.setCustomValidity("");
        $("#password2").removeClass("is-invalid");
        $('#error').text("");
        if ($("#password1").val() != $("#password2").val()) {
            $("#password2").addClass("is-invalid");
            $('#error').text("Пароли не совпадают");
            element.setCustomValidity("Invalid field");
        }
    });
    $('#form-edit-pass').submit(function (e) {
        e.preventDefault();
        $('#error').text("");
        if (!checkValidForm(this)) {
            return;
        }
        let url = document.location.pathname;
        console.log(url);
        $.post(url, $(this).serialize(), function (data) {
            if (data.err) {
                $('#modalCenter #modalTitle').text('Ошибка');
                $('#modalCenter #modalBody').html(data.err);
                return $('#modalCenter').modal('show');
            }
            $('#modalCenter #modalTitle').text('Изменение пароля');
            $('#modalCenter #modalBody').html(data.result);
            return $('#modalCenter').modal('show');
        });
    });
});