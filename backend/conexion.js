import mysql from 'mysql2';

// Configuración para Railway
export const conexion = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  connectTimeout: 60000
});

conexion.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a Railway:', err);
  } else {
    console.log('✅ Conectado a MySQL en Railway');
    console.log('📊 Base de datos:', process.env.MYSQLDATABASE);
  }
});

export default conexion;