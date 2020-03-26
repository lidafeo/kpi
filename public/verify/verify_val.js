$(document).ready(function() {
    $("body").on('submit', "#form-incorrect", function () {
        let sendValue = $(this).serialize();//JSON.stringify({comment: $(this)., user: $("#chooseuser").val()});
        let request = new XMLHttpRequest();
        //посылаем запрос на адрес "/invalid"
        request.open("POST", "/invalid", true);
        request.setRequestHeader("Content-Type", "application/json");
        request.addEventListener("load", function () {
            document.querySelector('#submit').click();
        });
        request.send(sendValue);
    });
});