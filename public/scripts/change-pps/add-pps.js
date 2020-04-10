$(document).ready(function() {

    let structure;
    new Promise((resolve, reject) => {
        getStructure(resolve);
    }).then(result => {
        getInfo();
    });

    //изменение должности
    $('#position').change(function() {
        getInfo();
    });

    //изменение факультета
    $("body").on('change', "#faculty", function() {
        let faculty = structure.faculty;
        let chooseFaculty = $("#faculty option:selected").text();
        let arrDep = structure.department[faculty.indexOf(chooseFaculty)];
        let departmentHTML = "";
        for(let i = 0; i < arrDep.length; i++) {
            departmentHTML += "<option>" + arrDep[i] + "</option>";
        }
        $('#department').html(departmentHTML);
    });

    //генерация пароля
    $("body").on('click', "#generate-pass", function (e) {
        e.preventDefault();
        $("#password").val(generatePassword(12));
    });

    $('#form-add-pps').submit(function (e) {
        e.preventDefault();
        if (this.checkValidity() === false) {
            return;
        }
        $.post('/change-pps/add-pps', $(this).serialize(), function (data) {
            if (data.err) {
                $('#modalCenter #modalTitle').text('Ошибка');
                $('#modalCenter #modalBody').html(data.err);
                return $('#modalCenter').modal('show');
            }
            $('#modalCenter #modalTitle').text('Добавление пользователя ППС');
            $('#modalCenter #modalBody').html(data.result);
            return $('#modalCenter').modal('show');
        });
    });

    function getInfo() {
        let position = $("#position option:selected").text();

        if(position == "Декан") {
            $("#department").attr("disabled", true);
            $('#department-div').hide();
        }
        else {
            $("#department").attr("disabled", false);
            let chooseFaculty = $("#faculty option:selected").text();
            let arrDep = structure.department[structure.faculty.indexOf(chooseFaculty)];
            let departmentHTML = "";
            for(let i = 0; i < arrDep.length; i++) {
                departmentHTML += "<option>" + arrDep[i] + "</option>";
            }
            $('#department').html(departmentHTML);
            $('#department-div').show();
        }
    }

    function getStructure(resolve) {
        let request = new XMLHttpRequest();
        //посылаем запрос на адрес "/structure.json"
        request.open("GET", "/structure.json", true);
        request.setRequestHeader("Content-Type", "application/json");
        request.addEventListener("load", function() {
            structure = JSON.parse(request.response);
            $("#faculty").attr("disabled", false);
            resolve();
        });
        request.send();
    }

    function generatePassword(length) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
});