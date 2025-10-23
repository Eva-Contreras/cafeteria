<?php
$host = "sql305.infinityfree.com"; // tu host (ver en cPanel de InfinityFree)
$usuario = "if0_40233460";         // tu nombre de usuario MySQL
$clave = "QGOzFjGkXpSnc";          // tu contraseña MySQL
$bd = "if0_40233460_cafeteriadb";  // el nombre de tu base de datos

$conexion = new mysqli($host, $usuario, $clave, $bd);

// Verificar conexión
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
} else {
    echo "Conexión exitosa";
}
?>
