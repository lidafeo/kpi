$(document).ready(function() {
    $('#form-users_from_file2').submit(function (e) {
        $('#but-file2').before('<div class="loader"></div>');
        //$('#but-file2').attr('disabled', true);
        $('#but-file2').remove();
    });
});