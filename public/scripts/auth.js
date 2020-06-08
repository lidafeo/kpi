$(document).ready(function() {
    $('#auth-form').submit(function (e) {
        e.preventDefault();
        $('#error-message').text("");
        if (this.checkValidity() === false) {
            return;
        }
        $.post('/', $(this).serialize(), function (data) {
            if (data.err) {
                $('#auth-form').removeClass('was-validated');
                return $('#error-message').text(data.err);
            }
            document.location.href = '/my-page';
        });
    });
});