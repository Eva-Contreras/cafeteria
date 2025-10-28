let mysql = require('mysql');

let conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cafeteria_db'
});

conexion.connect((error) => {
    if (error) {
        console.error('Error de conexion: ' + error.stack);
        return;
    }
})

