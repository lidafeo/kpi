process.env.NODE_ENV = 'test';

//let chai = require('chai');

let DB = require('../../../modules/db');
let updateDb = require('../../modules/updateDb');
let expect = require('chai').expect;

let service = require('../../../services/pps');

//основной блок
exports = describe('function services/pps/pageGetValuesKpi test', () => {

    beforeEach((done) => { //Перед каждым тестом чистим таблицы
        updateDb.update().then(result => {
            done();
        });
    });
    let userForTest = {"login": "ivanov", "position": "Доцент"};

    describe('test length of kpi', () => {
        it('C3T1', (done) => {
            service.pageGetValuesKpi(userForTest).then(result => {
                expect(result.kpi).to.be.an('array').that.to.be.empty;
                done();
            });
        });
        it('C3T2', (done) => {
            updateDb.addOneTestKpi().then(result => {
                let testValue = {"login_user": userForTest.login, "value": 1, "name_kpi": "type1sum0", "date": new Date(),
                    "text": "test", "link": null, "file": null, "number_criterion": 0,
                    "start_date": new Date(2020, 0, 10), "finish_date": new Date(2020, 1, 5)};
                let insertId = [];
                DB.userValues.insertValueKpiFromObj(testValue).then(result => {
                    insertId.push(result.insertId);
                    return DB.userValues.insertValueKpiFromObj(testValue);
                }).then(result => {
                    insertId.push(result.insertId);
                    return service.pageGetValuesKpi(userForTest);
                }).then(result => {
                    expect(result.kpi).to.be.an('array').that.to.have.lengthOf(2);
                    let arrId = [result.kpi[0].id, result.kpi[1].id];
                    expect(arrId).to.include.members(insertId);
                    done();
                });
            });
        });
    });
});