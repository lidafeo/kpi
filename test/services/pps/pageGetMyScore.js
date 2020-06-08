process.env.NODE_ENV = 'test';

//let chai = require('chai');

let DB = require('../../../modules/db');
let updateDb = require('../../modules/updateDb');
let expect = require('chai').expect;

let service = require('../../../services/pps');

//основной блок
exports = describe('function services/pps/pageGetMyScore test', () => {

    beforeEach((done) => { //Перед каждым тестом чистим таблицы
        updateDb.update().then(result=> {
            done();
        });
    });
    let userForTest = {"login": "ivanov", "position": "Доцент"};

    describe('test objPeriod', () => {
        it('C1T1', (done) => {
            DB.period.insertActualPeriod(new Date(2020, 1, 3), new Date(2020, 2, 5), "TestPeriod").then(re => {
                service.pageGetMyScore(userForTest).then(result => {
                    expect(result.objPeriod.d1.getFullYear()).to.equal(2020);
                    expect(result.objPeriod.d1.getMonth()).to.equal(1);
                    expect(result.objPeriod.d1.getDate()).to.equal(3);
                    expect(result.objPeriod.d2.getFullYear()).to.equal(2020);
                    expect(result.objPeriod.d2.getMonth()).to.equal(2);
                    expect(result.objPeriod.d2.getDate()).to.equal(5);
                    done();
                });
            });
        });
        it('C1T2', (done) => {
            DB.period.insertNotActualPeriod(new Date(2020, 1, 3), new Date(2020, 2, 5), "TestPeriod").then(re => {
                service.pageGetMyScore(userForTest).then(result => {
                    let date1 = new Date();
                    let date2 = new Date();
                    date1.setMonth(date1.getMonth() - 6);
                    expect(result.objPeriod.d1.getFullYear()).to.equal(date1.getFullYear());
                    expect(result.objPeriod.d1.getMonth()).to.equal(date1.getMonth());
                    expect(result.objPeriod.d1.getDate()).to.equal(date1.getDate());
                    expect(result.objPeriod.d2.getFullYear()).to.equal(date2.getFullYear());
                    expect(result.objPeriod.d2.getMonth()).to.equal(date2.getMonth());
                    expect(result.objPeriod.d2.getDate()).to.equal(date2.getDate());
                    done();
                });
            });
        });
    });
    describe('test calculation score', () => {
        beforeEach((done) => {
            updateDb.addAllTestKpi().then(result => {
                done();
            });
        });
        let commonInfoValue = {"login_user": userForTest.login, "date": new Date(), "start_date": new Date(2020, 1, 20),
            "finish_date": new Date(2020, 2, 20), "text": "test", "link": null, "file": null, "number_criterion": 0};
        it('C1T3', (done) => {
            let testValue = {"name_kpi": "type1sum0", "value": 1, ...commonInfoValue};
            DB.userValues.insertValueKpiFromObj(testValue).then(re => {
                service.pageGetMyScore(userForTest).then(result => {
                    let marks = result.kpi[0][0].userMark;
                    expect(marks).to.be.an('array').that.includes(5);
                    expect(marks.length).equal(1);
                    done();
                });
            });
        });
        it('C1T4', (done) => {
            let testValue = {"name_kpi": "type1sum1", "value": 1, ...commonInfoValue};
            let values = [testValue, testValue];
            Promise.all(values.map(DB.userValues.insertValueKpiFromObj)).then(re => {
                service.pageGetMyScore(userForTest).then(result => {
                    let marks = result.kpi[0][0].userMark;
                    expect(marks).to.be.an('array').that.includes(5);
                    expect(marks.length).equal(1);
                    done();
                });
            });
        });
        it('C1T5', (done) => {
            let testValue = {"name_kpi": "type2sum0", "value": 1, ...commonInfoValue};
            DB.userValues.insertValueKpiFromObj(testValue).then(re => {
                service.pageGetMyScore(userForTest).then(result => {
                    let marks = result.kpi[0][0].userMark;
                    expect(marks).to.be.an('array').that.includes(5);
                    expect(marks.length).equal(2);
                    done();
                });
            });
        });
        it('C1T6', (done) => {
            let testValue = {"name_kpi": "type2sum1", "value": 1, ...commonInfoValue};
            let values = [testValue, testValue];
            Promise.all(values.map(DB.userValues.insertValueKpiFromObj)).then(re => {
                service.pageGetMyScore(userForTest).then(result => {
                    let marks = result.kpi[0][0].userMark;
                    expect(marks).to.be.an('array').that.includes(5).that.includes(0);
                    expect(marks.length).equal(2);
                    done();
                });
            });
        });
    });
    describe('test selection values for calculating scores', () => {
        beforeEach((done) => {
            updateDb.addOneTestKpi().then(result => {
                done();
            });
        });
        let commonInfoValue = {"login_user": userForTest.login, "value": 1, "name_kpi": "type1sum0", "date": new Date(), "text": "test",
            "link": null, "file": null, "number_criterion": 0};
        it('C1T7', (done) => {
            let testValue = {"start_date": new Date(2020, 0, 10), "finish_date": new Date(2020, 1, 1), ...commonInfoValue};
            DB.userValues.insertValueKpiFromObj(testValue).then(re => {
                service.pageGetMyScore(userForTest).then(result => {
                    expect(result.kpi).to.be.a('null');
                    done();
                });
            });
        });
        it('C1T8', (done) => {
            let testValue = {"start_date": new Date(2020, 0, 10), "finish_date": new Date(2020, 1, 5), ...commonInfoValue};
            DB.userValues.insertValueKpiFromObj(testValue).then(re => {
                service.pageGetMyScore(userForTest).then(result => {
                    let marks = result.kpi[0][0].userMark;
                    expect(marks).to.be.an('array').that.includes(5);
                    done();
                });
            });
        });
        it('C1T9', (done) => {
            let testValue = {"start_date": new Date(2020, 0, 10), "finish_date": new Date(2020, 1, 20), ...commonInfoValue};
            DB.userValues.insertValueKpiFromObj(testValue).then(re => {
                service.pageGetMyScore(userForTest).then(result => {
                    let marks = result.kpi[0][0].userMark;
                    expect(marks).to.be.an('array').that.includes(5);
                    done();
                });
            });
        });
        it('C1T10', (done) => {
            let testValue = {"start_date": new Date(2020, 1, 5), "finish_date": new Date(2020, 2, 5), ...commonInfoValue};
            DB.userValues.insertValueKpiFromObj(testValue).then(re => {
                service.pageGetMyScore(userForTest).then(result => {
                    let marks = result.kpi[0][0].userMark;
                    expect(marks).to.be.an('array').that.includes(5);
                    done();
                });
            });
        });
        it('C1T11', (done) => {
            let testValue = {"start_date": new Date(2020, 1, 20), "finish_date": new Date(2020, 2, 20), ...commonInfoValue};
            DB.userValues.insertValueKpiFromObj(testValue).then(re => {
                service.pageGetMyScore(userForTest).then(result => {
                    let marks = result.kpi[0][0].userMark;
                    expect(marks).to.be.an('array').that.includes(5);
                    done();
                });
            });
        });
        it('C1T12', (done) => {
            let testValue = {"start_date": new Date(2020, 2, 5), "finish_date": new Date(2020, 2, 20), ...commonInfoValue};
            DB.userValues.insertValueKpiFromObj(testValue).then(re => {
                service.pageGetMyScore(userForTest).then(result => {
                    let marks = result.kpi[0][0].userMark;
                    expect(marks).to.be.an('array').that.includes(5);
                    done();
                });
            });
        });
        it('C1T13', (done) => {
            let testValue = {"start_date": new Date(2020, 1, 10), "finish_date": new Date(2020, 1, 20), ...commonInfoValue};
            DB.userValues.insertValueKpiFromObj(testValue).then(re => {
                service.pageGetMyScore(userForTest).then(result => {
                    let marks = result.kpi[0][0].userMark;
                    expect(marks).to.be.an('array').that.includes(5);
                    done();
                });
               });
        });
        it('C1T14', (done) => {
            let testValue = {"start_date": new Date(2020, 0, 20), "finish_date": new Date(2020, 2, 20), ...commonInfoValue};
            DB.userValues.insertValueKpiFromObj(testValue).then(re => {
                service.pageGetMyScore(userForTest).then(result => {
                    let marks = result.kpi[0][0].userMark;
                    expect(marks).to.be.an('array').that.includes(5);
                    done();
                });
            });
        });
        it('C1T15', (done) => {
            let testValue = {"start_date": new Date(2020, 2, 20), "finish_date": new Date(2020, 3, 20), ...commonInfoValue};
            DB.userValues.insertValueKpiFromObj(testValue).then(re => {
                service.pageGetMyScore(userForTest).then(result => {
                    expect(result.kpi).to.be.a('null');
                    done();
                });
            });
        });
    });
    describe('test array kpi if user does not have values', () => {
        it('C1T16', (done) => {
            service.pageGetMyScore(userForTest).then(result => {
                expect(result.kpi).to.be.a('null');
                done();
            });
        });
    });
    describe('test get scores with different statuses of values', () => {
        beforeEach((done) => {
            updateDb.addOneTestKpi().then(result => {
                done();
            });
        });
        let testValue = {"login_user": userForTest.login, "value": 1, "name_kpi": "type1sum0", "date": new Date(),
            "text": "test", "link": null, "file": null, "number_criterion": 0,
            "start_date": new Date(2020, 0, 10), "finish_date": new Date(2020, 1, 5)};

        it('C1T17', (done) => {
            DB.userValues.insertValueKpiFromObjWithValid({"valid": 1, ...testValue}).then(re => {
                service.pageGetMyScore(userForTest).then(result => {
                    let marks = result.kpi[0][0].userMark;
                    expect(marks).to.be.an('array').that.includes(5);
                    done();
                });
            });
        });
        it('C1T18', (done) => {
            DB.userValues.insertValueKpiFromObjWithValid({"valid": 0, ...testValue}).then(re => {
                service.pageGetMyScore(userForTest).then(result => {
                    expect(result.kpi).to.be.a('null');
                    done();
                });
            });
        });
    });
});