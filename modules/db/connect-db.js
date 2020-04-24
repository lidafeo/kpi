const mariadb = require('mariadb');
const config = require('../../config/config.json');

const pool = mariadb.createPool({
	host: config.db.host, 
	user: config.db.user, 
	password: config.db.password,
	database: 'kpi',
	connectionLimit: 5
});

module.exports = async function (query, obj) {
	let conn;
	try {
		conn = await pool.getConnection();
		let rows;
		if(obj)
			rows = conn.query(query, obj);
		else
			rows = conn.query(query);
		return rows;
	} catch (err) {
		throw err;
	} finally {
		if(conn) conn.end();
	}
};