$(document).ready(function() {
    $('#form-from_file').submit(function (e) {
        e.preventDefault();
        if (this.checkValidity() === false) {
            return;
        }
        $('#but-file').before('<div class="loader"></div>');
        $('#but-file').hide();
        let url = document.location.pathname;
        let data = new FormData();
        jQuery.each(jQuery('#file')[0].files, function(i, file) {
            data.append('file', file);
        });
        if ($('#option').is(":checked")) {
            data.append("option", "on");
        } else {
            data.append("option", "off");
        }
        jQuery.ajax({
            url:url,
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            method: 'POST',
            type: 'POST',
            success: function(data){
                if (data.err) {
                    $('#but-file').show();
                    $(".loader").remove();
                    $('#modalCenter #modalTitle').text('Ошибка');
                    $('#modalCenter #modalTitle').removeClass('text-success');
                    $('#modalCenter #modalTitle').addClass('text-danger');
                    $('#modalCenter #modalBody').html(data.err);
                    return $('#modalCenter').modal('show');
                }
                $(".content").html(data);
            }
        });
    });
});