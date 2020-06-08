const query = require('./connect-db');

//INSERT

//добавление criterion
exports.insertCriterion = function(criterion) {
    let arr = [criterion.name_kpi, criterion.name_criterion, criterion.number_criterion, criterion.description,
        criterion.start_val, criterion.final_val];
    let marks = criterion.marks;
    return new Promise((resolve, reject) => {
        query("INSERT INTO criterions VALUES (NULL, ?, ?, ?, ?, ?, ?)", arr).then(result => {
            for(let i = 0; i < marks.length; i++)
                marks[i][0] = result.insertId;
            Promise.all(marks.map(insertMarks)).then(result => {
                resolve(result);
            }).catch(err => {
                console.log(err);
                reject(err);
            });
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
};

function insertMarks(mark) {
    return query("INSERT INTO marks VALUES (?, ?, ?)", mark);
}

//SELECT

//получить все критерии
exports.selectAllCriterion = function(position) {
    return query("SELECT * FROM criterions, marks WHERE id=id_criterion AND position=? " +
        "ORDER BY name_kpi, criterions.number_criterion ASC", [position]);
};
/*
//получить один критерий
exports.selectOneCriterion = function(kpi, criterion) {
    return query("SELECT * FROM criterions WHERE name_kpi=? AND name_criterion=?",
        [kpi, criterion]);
};
 */

//получить критерии одного ПЭД
exports.selectCriterionsOneKPi = function(name_kpi) {
    return query("SELECT * FROM criterions WHERE name_kpi=? ORDER BY number_criterion ASC",
        [name_kpi]);
};

//UPDATE

//изменяем оценки ПЭД
exports.updateCriterion = function(newCriterion) {
    return query("UPDATE criterions SET name_criterion=?, criterion_description=?, start_val=?, final_val=? " +
        "WHERE id=?",
        [newCriterion.name_criterion, newCriterion.criterion_description, +newCriterion.start_val,
            newCriterion.final_val, newCriterion.id]);
};