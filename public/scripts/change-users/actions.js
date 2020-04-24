$(document).ready(function() {
    $('.delete-user').click(function (e) {
        e.preventDefault();
        $('#modalConfirm #modalBody').html("Вы действительно хотите удалить пользователя "
            + $(this).data('login') + '?');
        $('#modalConfirm #modalInfo').data('action', 'delete');
        $('#modalConfirm #modalInfo').data('login', $(this).data('login'));
        return $('#modalConfirm').modal('show');
    });
    $('#confirm-ok').click(function (e) {
        e.preventDefault();
        let action = $('#modalConfirm #modalInfo').data('action');
        let login = $('#modalConfirm #modalInfo').data('login');
        let url = '/change-users/' + action + '-user';
        $('#modalConfirm').modal('hide');
        $.post(url, {"login": login}, function (data) {
            if (data.err) {
                $('#modalCenter #modalTitle').text('Ошибка');
                $('#modalCenter #modalBody').html(data.err);
                return $('#modalCenter').modal('show');
            }
            $('#modalCenter #modalTitle').text('Успешно');
            $('#modalCenter #modalBody').html(data.result);
            return $('#modalCenter').modal('show');
        });
    });
});