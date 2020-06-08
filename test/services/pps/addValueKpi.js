process.env.NODE_ENV = 'test';

const path = require('path');
//let chai = require('chai');
const fs = require("fs");
let DB = require('../../../modules/db');
let updateDb = require('../../modules/updateDb');
let expect = require('chai').expect;

let service = require('../../../services/pps');

//основной блок
exports = describe('function services/pps/addValueKpi test', () => {

    beforeEach((done) => { //Перед каждым тестом чистим таблицы
        updateDb.update().then(result => {
            updateDb.addOneTestKpi().then(result => {
                done();
            });
        });
    });
    let userForTest = {"login": "ivanov", "position": "Доцент"};

    describe('test input', () => {
        it('C2T1', (done) => {
            let testDate = new Date();
            testDate.setDate(testDate.getDate() + 1);
            let testDateText = testDate.getFullYear() + '-' + (testDate.getMonth() + 1) + '-' + testDate.getDate();
            let testFields = {"name": "type1sum0", "text": "test", "value": "1",
                "date": testDateText, "criterion": "0", "link": ""};
            service.addValueKpi(userForTest, testFields, {}).then(result => {
                expect(result).to.have.a.property('err');
                expect(result.err).to.be.an('string').that.is.not.empty;
                done();
            });
        });
        it('C2T2', (done) => {
            let testFields = {"name": "type1sum0", "text": "test",
                "value": "0", "date": "2020-04-20", "criterion": "0", "link": ""};
            service.addValueKpi(userForTest, testFields, {}).then(result => {
                expect(result).to.have.a.property('err');
                expect(result.err).to.be.an('string').that.is.not.empty;
                done();
            });
        });
        it('C2T3', (done) => {
            let testFields = {"name": "type1sum0", "text": "test",
                "value": "-1", "date": "2020-04-20", "criterion": "0", "link": ""};
            service.addValueKpi(userForTest, testFields, {}).then(result => {
                expect(result).to.have.a.property('err');
                expect(result.err).to.be.an('string').that.is.not.empty;
                done();
            });
        });
        it('C2T4', (done) => {
            let testFields = {"name": "type1sum0", "text": "test",
                "value": "1", "date": "2020-04-20", "criterion": "-1", "link": ""};
            service.addValueKpi(userForTest, testFields, {}).then(result => {
                expect(result).to.have.a.property('err');
                expect(result.err).to.be.an('string').that.is.not.empty;
                done();
            });
        });
        it('C2T5', (done) => {
            let testFields = {"name": "type1sum0", "text": "test",
                "value": "1", "date": "2020-04-20", "criterion": "0", "link": ""};
            let testFiles = {"file" : {"size": 1048600, "name": "test.txt", "type": "text/plain"}};
            service.addValueKpi(userForTest, testFields, testFiles).then(result => {
                expect(result).to.have.a.property('err');
                expect(result.err).to.be.an('string').that.is.not.empty;
                done();
            });
        });
        it('C2T6', (done) => {
            let testFields = {"name": "type1sum0", "text": "",
                "value": "1", "date": "2020-04-20", "criterion": "0", "link": ""};
            service.addValueKpi(userForTest, testFields, {}).then(result => {
                expect(result).to.have.a.property('err');
                expect(result.err).to.be.an('string').that.is.not.empty;
                done();
            });
        });
    });
    describe('test save to table user_values', () => {
        it('C2T7', (done) => {
            let testFields = {
                "name": "type1sum0", "text": "test", "value": "1",
                "date": "2020-04-20", "criterion": "0", "link": ""
            };
            service.addValueKpi(userForTest, testFields, {}).then(result => {
                expect(result).to.not.have.a.property('err');
                DB.userValues.selectAllValueKpi().then(userValues => {
                    expect(userValues).to.have.lengthOf(1);
                    expect(userValues[0]).to.deep.include({"name_kpi": testFields.name, "text": testFields.text,
                    "value": +testFields.value, "link": testFields.link, "number_criterion": +testFields.criterion});
                    done();
                });
            });
        });
    });
    describe('test save file', () => {
        it('C2T8', (done) => {
            let testFields = {
                "name": "type1sum0", "text": "test", "value": "1",
                "date": "2020-04-20", "criterion": "0", "link": ""
            };
            let testFiles = {"file" : {"path": __dirname + '\\test.txt',
                    "name": "test.txt", "type": "text/plain"}};
            fs.writeFileSync(testFiles.file.path, "test", 'utf8');
            let stats = fs.statSync(testFiles.file.path);
            testFiles.file.size = stats["size"];
            service.addValueKpi(userForTest, testFields, testFiles).then(result => {
                expect(result).to.not.have.a.property('err');
                DB.userValues.selectAllValueKpi().then(userValues => {
                    expect(userValues).to.have.lengthOf(1);
                    let norm = path.resolve('./user_files/' + userValues[0].file);
                    setTimeout(() => {
                        let content = fs.readFileSync('./user_files/' + userValues[0].file, 'utf8');
                        expect(content).to.equal("test");
                        fs.unlinkSync(testFiles.file.path);
                        fs.unlinkSync('./user_files/' + userValues[0].file);
                        done();
                    }, 1000);
                });
            });
        });
    });
});