$(document).ready(function() {
    $(document).on('change', '.custom-file-input', function (e) {
        if (this.files[0]) {
            return $('#label-file').text(this.files[0].name);
        }
        $('#label-file').text('Выберите файл...');
    });
});