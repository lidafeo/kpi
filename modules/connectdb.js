const mariadb = require('mariadb');
const config = require('../config/config.json');

const pool = mariadb.createPool({
	host: config.db.host, 
	user: config.db.user, 
	password: config.db.password,
	database: 'kpi',
	connectionLimit: 5
});

module.exports = async function (query) {
	let conn;
	try {
		conn = await pool.getConnection();
		let rows = conn.query(query);
		return rows;
	} catch (err) {
		throw err;
	} finally {
		if(conn) conn.end();
	}
}
//let connect = pool.getConnection;//().then(conn => {
	/*conn.query("SELECT 1 as val").then((rows) => {
		console.log(rows);
		conn.end();
	}).catch(err => {
		console.log(err);
		conn.end();
	})
}).catch(err => {
	console.log("not connected: " + err);
});*/
//module.exports = pool;
//module.exports = connect;