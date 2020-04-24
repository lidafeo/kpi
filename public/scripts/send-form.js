$(document).ready(function() {
    $('#form-send').submit(function (e) {
        e.preventDefault();
        if (this.checkValidity() === false) {
            return;
        }
        let url = document.location.pathname;
        $.post(url, $(this).serialize(), function (data) {
            if (data.err) {
                $('#modalCenter #modalTitle').text('Ошибка');
                $('#modalCenter #modalTitle').removeClass('text-success');
                $('#modalCenter #modalTitle').addClass('text-danger');
                $('#modalCenter #modalBody').html(data.err);
                return $('#modalCenter').modal('show');
            }
            $('#modalCenter #modalTitle').text('Успешно');
            $('#modalCenter #modalTitle').removeClass('text-danger');
            $('#modalCenter #modalTitle').addClass('text-success');
            $('#modalCenter #modalBody').html(data.result);
            return $('#modalCenter').modal('show');
        });
    });
});