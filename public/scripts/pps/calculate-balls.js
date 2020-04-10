$(document).ready(function() {
    $('body').on('submit', '#form-date', function (e) {
        let date1 = new Date($('#date1').val());
        let date2 = new Date($('#date2').val());
        if(date1 > date2) {
            let dateSave = $('#date2').val();
            $('#date2').val($('#date1').val());
            $('#date1').val(dateSave);
        }
    });
});