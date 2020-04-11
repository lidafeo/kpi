$(document).ready(function() {
    $('#form-edit-pass').submit(function (e) {
        e.preventDefault();
        if (this.checkValidity() === false) {
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
            $('#modalCenter #modalTitle').text('Изменение пароля пользователя');
            $('#modalCenter #modalBody').html(data.result);
            return $('#modalCenter').modal('show');
        });
    });
});