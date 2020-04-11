$('.table-filters input').on('input', function () {
    filterTable(0, $(this).val());
});

function filterTable(index, val) {
    let $rows = $('.table-data');
    $rows.each(function (rowIndex) {
        let valid = true;
        $(this).find('th').each(function (colIndex) {
            if (index == colIndex) {
                if ($(this).html().toLowerCase().indexOf(val.toLowerCase()) == -1) {
                    valid = false;
                }
            }
        });
        if (valid === true) {
            $(this).css('display', '');
        } else {
            $(this).css('display', 'none');
        }
    });
}