$(document).ready(function() {
    //генерация пароля
    $("body").on('click', "#generate-pass", function (e) {
        e.preventDefault();
        $("#password").val(generatePassword(12));
    });

    function generatePassword(length) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
});