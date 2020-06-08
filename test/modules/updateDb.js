let DB = require('../../modules/db');

exports.update = async function () {
    let clearUserValues = await DB.userValues.deleteAllUserValues();
    let clearPeriod = await DB.period.deleteAllPeriods();
    let clearUsers = await DB.users.deleteAllPps();

    let testUser = {name: 'Иванов Иван Иванович', role: 'ППС', position: 'Доцент', faculty: "Информационные технологии",
        department: 'Информационная безопасность (ИБ)', login: 'ivanov', password: '123'};
    let addUser = await DB.users.insertUserFromObj(testUser);
    return null;
};

exports.addAllTestKpi = async function () {
    let clearKpi = await DB.kpi.deleteAllKpi();

    let commonInfoKpi = {"section": 'Тест', "subtype": null, "count_criterion": 2, "description": "Тестовый ПЭД", "action_time": 0};
    let testKpi = [];
    testKpi.push({"name": "type1sum0", "number": 1, "type": 1, "indicator_sum": 0, ...commonInfoKpi});
    testKpi.push({"name": "type1sum1", "number": 2, "type": 1, "indicator_sum": 1, ...commonInfoKpi});
    testKpi.push({"name": "type2sum0", "number": 3, "type": 2, "indicator_sum": 0, ...commonInfoKpi});
    testKpi.push({"name": "type2sum1", "number": 4, "type": 2, "indicator_sum": 1, ...commonInfoKpi});
    let addKpi = await Promise.all(testKpi.map(DB.kpi.insertKpi));

    let positions = await DB.positions.selectPositions();
    let marks = [];
    for(let j = 0; j < positions.length; j ++) {
        let mark = (positions[j].position == 'Доцент') ? 5 : 3;
        marks.push([0, positions[j].position, mark]);
    }
    let commonInfoCriterion = {"name_criterion": "testCriterion", "description": null, "marks": marks};
    let testCriterions = [];
    for(let i = 0; i < 2; i++) {
        let startVal = i == 0 ? 1 : 3;
        let finalVal = i == 0 ? 2 : null;
        testCriterions.push({"name_kpi": "type1sum0", "number_criterion": i, "start_val": startVal, "final_val": finalVal, ...commonInfoCriterion});
        testCriterions.push({"name_kpi": "type1sum1", "number_criterion": i, "start_val": startVal, "final_val": finalVal, ...commonInfoCriterion});
        testCriterions.push({"name_kpi": "type2sum0", "number_criterion": i, "start_val": startVal, "final_val": finalVal, ...commonInfoCriterion});
        testCriterions.push({"name_kpi": "type2sum1", "number_criterion": i, "start_val": startVal, "final_val": finalVal, ...commonInfoCriterion});
    }
    for(let i = 0; i < testCriterions.length; i++) {
        let addCriterions = await DB.criterions.insertCriterion(testCriterions[i]);
    }
    let addActivePeriod = await DB.period.insertActualPeriod(new Date(2020, 1, 5), new Date(2020, 2, 5), "TestPeriod");
    return null;
};

exports.addOneTestKpi = async function () {
    let clearKpi = await DB.kpi.deleteAllKpi();
    let testKpi = {"name": "type1sum0", "number": 1, "type": 1, "indicator_sum": 0, "section": 'Тест', "subtype": null,
        "count_criterion": 2, "description": "Тестовый ПЭД", "action_time": 0};
    let addKpi = await DB.kpi.insertKpi(testKpi);
    let positions = await DB.positions.selectPositions();
    let marks = [];
    for(let j = 0; j < positions.length; j ++) {
        let mark = (positions[j].position == 'Доцент') ? 5 : 3;
        marks.push([0, positions[j].position, mark]);
    }
    let addCriterions0 = await  DB.criterions.insertCriterion({"name_kpi": "type1sum0", "number_criterion": 0,
        "start_val": 1, "final_val": 2, "name_criterion": "testCriterion", "description": null, "marks": marks});
    let addCriterions1 = await  DB.criterions.insertCriterion({"name_kpi": "type1sum0", "number_criterion": 1,
        "start_val": 3, "final_val": null, "name_criterion": "testCriterion", "description": null, "marks": marks});

    let addActivePeriod = await DB.period.insertActualPeriod(new Date(2020, 1, 5), new Date(2020, 2, 5), "TestPeriod");
    return null;
};