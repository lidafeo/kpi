$(document).ready(function() {
    $('.delete-kpi').click(function (e) {
        e.preventDefault();
        $('#modalConfirm #modalBody').html("Вы действительно хотите удалить ПЭД "
            + $(this).data('name') + '?');
        $('#modalConfirm #modalInfo').data('action', 'delete');
        $('#modalConfirm #modalInfo').data('name', $(this).data('name'));
        return $('#modalConfirm').modal('show');
    });
    $('#confirm-ok').click(function (e) {
        e.preventDefault();
        let action = $('#modalConfirm #modalInfo').data('action');
        let name = $('#modalConfirm #modalInfo').data('name');
        let url = '/change-kpi/' + action + '-kpi';
        $('#modalConfirm').modal('hide');
        $.post(url, {"name": name}, function (data) {
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