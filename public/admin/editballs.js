$(document).ready(function() {
    let change = false;
    
    $(".inp").change(function() {
        change = true;
    });

    $('#submit').click(function(e) {
        if(!change) {
            e.preventDefault();
            alert("Измените значения");
        }
    });
});