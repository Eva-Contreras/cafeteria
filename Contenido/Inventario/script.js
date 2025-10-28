// ==================== VARIABLES GLOBALES ====================
let productosDB = []; // Almacena todos los productos cargados de la BD
let productoActual = null;
let configuracionActual = null;
let idProductoActual = null;

// ==================== ELEMENTOS DEL DOM ====================
const modal = document.getElementById('modal_editar');
const spanCerrar = document.getElementsByClassName('cerrar')[0];
const btnCancelar = document.querySelector('.btn_cancelar');
const formModal = document.getElementById('form_modal');
const inputNombreProducto = document.getElementById('nombre_producto');
const unidadesInput = document.getElementById('cantidad_unidades');
const gramosAbiertosInput = document.getElementById('cantidad_gramos');

// ==================== API FUNCTIONS ====================
const API_URL = 'https://eva.page.gd/Cafeteria_Java/conexion/productos.php';

// Cargar productos desde la base de datos
async function cargarProductos() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        
        if (result.success) {
            productosDB = result.data;
            actualizarInterfaz(result.data);
            console.log('✅ Productos cargados desde BD:', result.data);
        } else {
            console.error('❌ Error al cargar productos:', result.error);
            alert('Error al cargar productos de la base de datos');
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        alert('Error de conexión con el servidor');
    }
}

// Actualizar stock en la base de datos
async function actualizarStock(idProducto, nuevoStock) {
    try {
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_producto: idProducto,
                stock: nuevoStock
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Stock actualizado en BD:', result.message);
            return true;
        } else {
            console.error('❌ Error al actualizar:', result.error);
            alert('Error al guardar en la base de datos');
            return false;
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        alert('Error de conexión al guardar');
        return false;
    }
}

// ==================== OBTENER CONFIGURACIÓN DESDE BD ====================
function obtenerConfiguracion(nombreProducto) {
    const producto = productosDB.find(p => p.nombre === nombreProducto);
    
    if (!producto) {
        console.error('Producto no encontrado en BD:', nombreProducto);
        return null;
    }
    
    return {
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        unidadMedida: producto.unidad_medida || 'g',
        pesoUnidad: parseFloat(producto.peso_unidad) || 1,
        minUnidades: 0,
        maxUnidades: 20,
        minAbierto: parseFloat(producto.stock_minimo) || 0,
        maxAbierto: parseFloat(producto.stock_maximo) || 5000,
        stockActual: parseFloat(producto.stock) || 0
    };
}

// ==================== ACTUALIZAR INTERFAZ ====================
function actualizarInterfaz(productos) {
    productos.forEach(producto => {
        const elementos = document.querySelectorAll('.producto');
        
        elementos.forEach(elem => {
            const nombre = elem.querySelector('h3').textContent.trim();
            
            if (nombre === producto.nombre) {
                const inputCantidad = elem.querySelector('input[type="number"]');
                if (inputCantidad) {
                    inputCantidad.value = parseFloat(producto.stock).toFixed(2);
                }
                
                elem.dataset.idProducto = producto.id_producto;
                
                console.log(`📦 ${nombre} - Stock: ${producto.stock} ${producto.unidad_medida}`);
            }
        });
    });
}

// ==================== FUNCIÓN PARA ABRIR EL MODAL ====================
function abrirModal(nombreProducto, cantidadActual, idProducto) {
    const config = obtenerConfiguracion(nombreProducto);
    
    if (!config) {
        alert(`No se encontró configuración para: ${nombreProducto}`);
        return;
    }
    
    configuracionActual = config;
    idProductoActual = idProducto;
    
    inputNombreProducto.value = nombreProducto;
    
    // Actualiza los límites de los inputs
    unidadesInput.min = config.minUnidades;
    unidadesInput.max = config.maxUnidades;
    gramosAbiertosInput.min = config.minAbierto;
    gramosAbiertosInput.max = config.maxAbierto;
    
    // Calcular cuántas unidades completas y cantidad suelta hay
    const unidadesCompletas = Math.floor(cantidadActual / config.pesoUnidad);
    const cantidadSuelta = cantidadActual % config.pesoUnidad;
    
    unidadesInput.value = unidadesCompletas;
    gramosAbiertosInput.value = cantidadSuelta.toFixed(2);
    
    console.log('📝 Modal abierto para:', {
        producto: nombreProducto,
        unidadMedida: config.unidadMedida,
        pesoUnidad: config.pesoUnidad,
        stockActual: cantidadActual
    });
    
    // Mostrar el modal
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
}

// ==================== EVENT LISTENERS ====================
const botonesEditar = document.querySelectorAll('#btn_editar');

botonesEditar.forEach(boton => {
    boton.onclick = function() {
        productoActual = this.closest('.producto');
        
        const nombreProducto = productoActual.querySelector('h3').textContent.trim();
        const cantidadActual = parseFloat(productoActual.querySelector('input[type="number"]').value) || 0;
        const idProducto = productoActual.dataset.idProducto;
        
        if (!idProducto) {
            alert('Error: Este producto no está registrado en la base de datos');
            return;
        }
        
        abrirModal(nombreProducto, cantidadActual, idProducto);
    }
});

// Cerrar modal
spanCerrar.onclick = function() {
    modal.style.display = 'none';
}

btnCancelar.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// ==================== GUARDAR CAMBIOS ====================
formModal.onsubmit = async function(e) {
    e.preventDefault();
    
    if (!configuracionActual || !productoActual) {
        alert('Error: No hay producto seleccionado');
        return;
    }
    
    const unidades = parseFloat(unidadesInput.value) || 0;
    const cantidadAbierta = parseFloat(gramosAbiertosInput.value) || 0;
    
    // Validaciones
    if (unidades < configuracionActual.minUnidades || unidades > configuracionActual.maxUnidades) {
        alert(`Las unidades deben estar entre ${configuracionActual.minUnidades} y ${configuracionActual.maxUnidades}`);
        return;
    }
    
    if (cantidadAbierta < configuracionActual.minAbierto || cantidadAbierta > configuracionActual.maxAbierto) {
        alert(`La cantidad abierta debe estar entre ${configuracionActual.minAbierto} y ${configuracionActual.maxAbierto} ${configuracionActual.unidadMedida}`);
        return;
    }
    
    // Calcular el total
    const totalGramos = (unidades * configuracionActual.pesoUnidad) + cantidadAbierta;
    
    // Actualizar en la base de datos
    const actualizado = await actualizarStock(idProductoActual, totalGramos);
    
    if (actualizado) {
        const inputCantidad = productoActual.querySelector('input[type="number"]');
        inputCantidad.value = totalGramos.toFixed(2);
        
        // Actualizar también en el array local
        const producto = productosDB.find(p => p.id_producto == idProductoActual);
        if (producto) {
            producto.stock = totalGramos;
        }
        
        console.log('=== ✅ Producto actualizado ===');
        console.log('Producto:', configuracionActual.nombre);
        console.log('ID:', idProductoActual);
        console.log('Unidades sin abrir:', unidades);
        console.log('Cantidad abierta:', cantidadAbierta, configuracionActual.unidadMedida);
        console.log('Total:', totalGramos, configuracionActual.unidadMedida);
        
        modal.style.display = 'none';
        alert('✅ Cantidad actualizada correctamente en la base de datos');
    }
}

// ==================== INICIALIZAR ====================
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando sistema de inventario...');
    console.log('📡 Conectando con la base de datos...');
    cargarProductos();
});