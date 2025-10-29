import mysql from 'mysql2';

// Configuración para Railway
export const conexion = mysql.createConnection({
  host: process.env.MYSQL_HOST || 'mysql.railway.internal',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'HNuHYLZABucmYMDIoGsyVcmiTSmKsejQ',
  database: process.env.MYSQL_DATABASE || 'railway',
  port: process.env.MYSQL_PORT || 3306,
  connectTimeout: 60000 // Timeout de 60 segundos
});

conexion.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar con Railway:', err.message);
    console.error('Código de error:', err.code);
    console.error('Detalles:', err);
    process.exit(1); // Termina el proceso si no hay conexión
  } else {
    console.log('✅ Conectado exitosamente a MySQL en Railway');
    console.log('📊 Base de datos:', process.env.MYSQL_DATABASE || 'railway');
  }
});

// Manejo de errores de conexión
conexion.on('error', (err) => {
  console.error('❌ Error de conexión a la base de datos:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('La conexión con la base de datos se perdió.');
  }
});

export default conexion;