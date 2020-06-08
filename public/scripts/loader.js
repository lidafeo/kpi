$(document).ready(function() {
    $('#form-from_file').submit(function (e) {
        $('#but-file').before('<div class="loader"></div>');
        $('#but-file').remove();
    });
});