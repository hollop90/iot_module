//Look at the following URL for the API documentation for the nodejs mariadb module:
//github.com/mariadb-corporation/mariadb-connector-nodejs/blob/master/documentation/callback-api.md

//******* Setup *******// 
/* Open a terminal and start the mariadb server process with the following command:
       sudo systemctl start mariadb

   Go to the folder where this file is saved and set up a npm package with the following command:
       sudo npm init

   Install the nodejs mariadb module with the following command
       sudo npm install mariadb
*/

/* This script assumes that there is a DB table called 'iotTable'
   with two columns, 'deviceName' and 'accelVal' in the database 
   on the mariadb database server - if not see sample1 code to set 
   that up!

    **** NOTE: You will need to all the items enclosed in <> brackets 
	to match your credentials ****
*/

const mariadb = require('mariadb/callback');
const dbConn = mariadb.createConnection({host: '127.0.0.1', user:'ugo', password: 'ugo', database: 'ugo_iot'});

dbConn.query('INSERT INTO iotTable VALUES ("Woody Microbit", 8283)', insertCallback);

function insertCallback(err, res)  	{
	if (err) {
      console.log(err.message);
    } else {
		console.log(res); 
		dbConn.end();
	}
}

/*To check that the code has executed correctly and that a row of data has been 
  added to the iotTable open a new terminal window and type: 
      sudo mariadb -u<your_mariadb_username> -p<your_mariadb_password>
  This will open the mariadb DBMS (database management system)

  To view a list of all the databases on the database server use the command:
      show databases; 

  Pick out your database from the list with the following command with your own database name:
      use <your_mariadb_database>;

  To check if the table named above has been created use the following command
      show tables;
  You should see the table named 'iotTable' listed
  
  Now enter the following SELECT statement to see all the data in the iotTable
      select * from iotTable;
	  
  Note: to insert data in the iotTable table 'manually' using the mariadb DBMS you 
  would use the SQL command at the database prompt:
      INSERT INTO iotTable (deviceName, accelVal) VALUES ("Woody Microbit", 8283); 
*/


