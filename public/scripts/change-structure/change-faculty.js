$(document).ready(function() {
    $('.change-faculty').click(function (e) {
        e.preventDefault();
        let faculty = $(this).parent('div.field-value').data('name');
        $('.form-change[data-name="' + faculty + '"]').removeClass('d-none');
        $(this).parent('div.field-value').addClass('d-none');
    });
    $('.cancel').click(function (e) {
        let faculty = $(this).parents('div.form-change').data('name');
        $('.form-change[data-name="' + faculty + '"]').addClass('d-none');
        $('.field-value[data-name="' + faculty + '"]').removeClass('d-none');
    });
    $('.change-sub').submit(function (e) {
        e.preventDefault();
        if (this.checkValidity() === false) {
            return;
        }
        //let faculty = $(this).parent('div.form-change').data('name');
        //let newFaculty = $('.form-change[data-name="' + faculty + '"] #new').val();
        $.post('/change-structure/change-faculty', $(this).serialize(), function (data) {
            if (data.err) {
                $('#modalCenter #modalTitle').text('Ошибка');
                $('#modalCenter #modalTitle').removeClass('text-success');
                $('#modalCenter #modalTitle').addClass('text-danger');
                $('#modalCenter #modalBody').html(data.err);
                return $('#modalCenter').modal('show');
            }
            window.location.reload();
            /*
            $('.form-change[data-name="' + faculty + '"]').addClass('d-none');
            $('.field-value[data-name="' + faculty + '"]').removeClass('d-none');

            $('.form-change[data-name="' + faculty + '"] #old').val(newFaculty);
            $('.field-value[data-name="' + faculty + '"] span').text(newFaculty);
            $('.field-value[data-name="' + faculty + '"]').data('name', newFaculty);
            $('.form-change[data-name="' + faculty + '"]').data('name', newFaculty);
             */
        });
    });
});