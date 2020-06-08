$(document).ready(function() {
    $('.change-val').click(function (e) {
        e.preventDefault();
        let type = $(this).data('type');
        $("#" + type + " .field-value").addClass('d-none');
        $("#" + type + " .form-change").removeClass('d-none');
    });
    $('.cancel').click(function (e) {
        let type = $(this).data('type');
        $("#" + type + " .field-value").removeClass('d-none');
        $("#" + type + " .form-change").addClass('d-none');
    });
    $('.change-sub').submit(function (e) {
        e.preventDefault();
        if (this.checkValidity() === false) {
            return;
        }
        let form = new FormData();
        let request = new XMLHttpRequest();
        form.append('id', $(this).data('id'));
        $(this).find ('input, textarea').each(function() {
            if(this.name == 'file') {
                form.append(this.name, $(this)[0].files[0]);
            } else {
                form.append(this.name, $(this).val());
            }
        });
        request.open("POST", "/pps/change-field-val", true);
        request.onload = function(ev) {
            let result = JSON.parse(request.response);
            let name = result.name;
            if(result.err) {
                $("#" + name + " .field-value").removeClass('d-none');
                $("#" + name + " .form-change").addClass('d-none');
            } else {
                if(name == 'file') {
                    $("#" + name + " .field-value .a-file").attr("href", "/download-file?file=" + result.value);
                } else if(name == 'link') {
                    $("#" + name + " .field-value .a-link").attr("href", result.value);
                    $("#" + name + " .field-value .a-link").html(result.value);
                } else {
                    $("#" + name + " .field-value span").html(result.value);
                }
                $("#" + name + " .field-value").removeClass('d-none');
                $("#" + name + " .form-change").addClass('d-none');
            }
        };
        request.send(form);
    });
    $('.delete-value').click(function (e) {
        e.preventDefault();
        $('#modalConfirm #modalBody').html("Вы действительно хотите удалить это значение?");
        $('#modalConfirm #modalInfo').data('id', $(this).data('id'));
        return $('#modalConfirm').modal('show');
    });
    $('#confirm-ok').click(function (e) {
        e.preventDefault();
        let id = $('#modalConfirm #modalInfo').data('id');
        $('#modalConfirm').modal('hide');
        $.post('/pps/delete-val', {"id": id}, function (data) {
            if (data.err) {
                $('#modalCenter #modalTitle').text('Ошибка');
                $('#modalCenter #modalBody').html(data.err);
                return $('#modalCenter').modal('show');
            }
            window.location.replace('/pps/get-values-kpi');
        });
    });
});