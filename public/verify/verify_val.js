$(document).ready(function() {
    $("body").on('submit', "#form-incorrect", function (e) {
        e.preventDefault();
        let comment = $('#form-incorrect #comment').val();
        let id = $("#form-incorrect #id").val();
        console.log(id);
        let sendValue = JSON.stringify({comment: comment, id: id});
        let request = new XMLHttpRequest();
        //посылаем запрос на адрес "/invalid"
        request.open("POST", "/invalid", true);
        request.setRequestHeader("Content-Type", "application/json");
        request.addEventListener("load", function () {
            let resp = JSON.parse(request.response);
            if(resp['result'] == 'ok') {
                $('#modalCenter #modalTitle').text('Отметка недействительности значения');
                $('#modalCenter #modalBody').html('Данное выполнение ПЭД успешно отмечено как недействительное');
                $('#div-incorrect').html('');
                $('#div-cancel').html('<h3 class="text-danger">Данное значение уже отмечено как неверное</h3>' +
                    '<table class="table">' +
                    '<tbody>' +
                    '<tr>' +
                    '<th scope="row">Проверил</th>' +
                    '<td>' + resp.login + '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<th scope="row">Причина отметки о недействительности</th>' +
                    '<td>' + comment + '</td>' +
                    '</tr>' +
                    '</tbody>' +
                    '</table>' +
                    '<form id="form-cancel">' +
                    '<input type="hidden" name="id" id="id-cancel" value="' + id + '">' +
                    '<div class="form-group row">' +
                    '<div class="col-sm-5">' +
                    '<button type="submit" class="btn btn-secondary">Восстановить действительность значения ПЭД</button>' +
                    '</div>' +
                    '</div>' +
                    '</form>');
                return $('#modalCenter').modal('show');
            }
            $('#modalCenter #modalTitle').text('Ошибка');
            $('#modalCenter #modalBody').html('<div class="text-danger">Отметить данное выполнение ПЭД не удалось</div>');
            return $('#modalCenter').modal('show');
            //document.querySelector('#submit').click();
        });
        request.send(sendValue);
    });

    $("body").on('submit', "#form-cancel", function (e) {
        e.preventDefault();
        let id = $('#form-cancel #id-cancel').val();
        console.log(id);
        let sendValue = JSON.stringify({id: id});
        let request = new XMLHttpRequest();
        //посылаем запрос на адрес "/invalid"
        request.open("POST", "/cancel-invalid", true);
        request.setRequestHeader("Content-Type", "application/json");
        request.addEventListener("load", function () {
            let resp = JSON.parse(request.response);
            if(resp['result'] == 'ok') {
                $('#modalCenter #modalTitle').text('Отмена недействительности значения');
                $('#modalCenter #modalBody').html('Данное выполнение ПЭД успешно отмечено как действительное (выполнена отмена)');
                $('#div-incorrect').html('<h3>Отметить данное исполнение ПЭД как неверное</h3>' +
                                    '<form class="needs-validation" id="form-incorrect" novalidate>' +
                                        '<input type="hidden" name="id" id="id" value="' + id + '">' +
                                        '<div class="form-group row">' +
                                            '<label for="comment" class="col-sm col-form-label">Причина отметки недействительности:</label>' +
                                        '</div>' +
                                        '<div class="form-group row">' +
                                            '<div class="col-sm-10">' +
                                                '<textarea class="form-control" id="comment" name="comment" required></textarea>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="form-group row">' +
                                            '<div class="col-sm-3">' +
                                                '<button type="submit" class="btn btn-primary">Отметить</button>' +
                                            '</div>' +
                                        '</div>' +
                                    '</form>');
                $('#div-cancel').html('');
                return $('#modalCenter').modal('show');
            }
            $('#modalCenter #modalTitle').text('Ошибка');
            $('#modalCenter #modalBody').html('<div class="text-danger">Сделать данное выполнение ПЭД действительным не удалось</div>');
            return $('#modalCenter').modal('show');
        });
        request.send(sendValue);
    });
});