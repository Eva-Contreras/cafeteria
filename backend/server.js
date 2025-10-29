import express from 'express';
import cors from 'cors';
import { conexion } from './conexion.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Para usar __dirname con ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos - CORREGIDO para tu estructura
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/inventario', express.static(path.join(__dirname, '../frontend/Inventario')));
app.use('/pedidos', express.static(path.join(__dirname, '../frontend/Pedidos')));

// ==================== RUTAS PARA EL FRONTEND ====================

// Ruta para la página de inicio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/Inicio/inicio.html'));
});

// Ruta para inventario
app.get('/inventario', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/Inventario/inventario_menu.html'));
});

// Ruta para pedidos
app.get('/pedidos', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/Pedidos/pedidos.html'));
});

// ==================== RUTAS DE LA API ====================

// Health check para verificar conexión a DB
app.get('/api/health', (req, res) => {
  conexion.query('SELECT 1 as connected', (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        error: 'Error de conexión a la base de datos',
        details: err.message 
      });
    }
    
    res.json({ 
      success: true, 
      message: '✅ API y base de datos funcionando correctamente',
      timestamp: new Date().toISOString(),
      database: 'Conectado'
    });
  });
});

// Ruta de información de la API
app.get('/api', (req, res) => {
  res.json({ 
    message: '☕ API Cafetería JAVA funcionando',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      productos: '/api/productos',
      categorias: '/api/categorias',
      productosById: '/api/productos/:id'
    }
  });
});

// ==================== RUTAS DE PRODUCTOS ====================

// Obtener todos los productos
app.get('/api/productos', (req, res) => {
  const sql = `
    SELECT p.*, c.nombre_categoria 
    FROM Productos p 
    LEFT JOIN Categorias c ON p.id_categoria = c.id_categoria 
    ORDER BY c.nombre_categoria, p.nombre
  `;
  
  conexion.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener productos:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    res.json({ 
      success: true, 
      data: results,
      total: results.length
    });
  });
});

// Obtener un producto por ID
app.get('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.*, c.nombre_categoria 
    FROM Productos p 
    LEFT JOIN Categorias c ON p.id_categoria = c.id_categoria 
    WHERE p.id_producto = ?
  `;
  
  conexion.query(sql, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener producto:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Producto no encontrado' 
      });
    }
    
    res.json({ 
      success: true, 
      data: results[0] 
    });
  });
});

// Crear nuevo producto
app.post('/api/productos', (req, res) => {
  const { nombre, descripcion, precio, stock, id_categoria, unidad_medida, peso_unidad, stock_minimo, stock_maximo } = req.body;
  
  // Validaciones básicas
  if (!nombre || !precio || !id_categoria) {
    return res.status(400).json({
      success: false,
      error: 'Nombre, precio y categoría son obligatorios'
    });
  }
  
  const sql = `
    INSERT INTO Productos (nombre, descripcion, precio, stock, id_categoria, unidad_medida, peso_unidad, stock_minimo, stock_maximo) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  conexion.query(sql, [
    nombre, descripcion, precio, stock || 0, id_categoria, 
    unidad_medida, peso_unidad, stock_minimo, stock_maximo
  ], (err, result) => {
    if (err) {
      console.error('❌ Error al crear producto:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    res.status(201).json({ 
      success: true, 
      id: result.insertId,
      message: 'Producto creado correctamente' 
    });
  });
});

// Actualizar producto completo
app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, id_categoria, unidad_medida, peso_unidad, stock_minimo, stock_maximo } = req.body;
  
  const sql = `
    UPDATE Productos 
    SET nombre = ?, descripcion = ?, precio = ?, stock = ?, id_categoria = ?, 
        unidad_medida = ?, peso_unidad = ?, stock_minimo = ?, stock_maximo = ?
    WHERE id_producto = ?
  `;
  
  conexion.query(sql, [
    nombre, descripcion, precio, stock, id_categoria, 
    unidad_medida, peso_unidad, stock_minimo, stock_maximo, id
  ], (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar producto:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Producto no encontrado' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Producto actualizado correctamente' 
    });
  });
});

// Actualizar solo el stock de un producto
app.patch('/api/productos/:id/stock', (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  
  if (stock === undefined) {
    return res.status(400).json({
      success: false,
      error: 'El campo stock es requerido'
    });
  }
  
  const sql = 'UPDATE Productos SET stock = ? WHERE id_producto = ?';
  
  conexion.query(sql, [stock, id], (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar stock:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Producto no encontrado' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Stock actualizado correctamente' 
    });
  });
});

// Eliminar producto
app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM Productos WHERE id_producto = ?';
  
  conexion.query(sql, [id], (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar producto:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Producto no encontrado' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Producto eliminado correctamente' 
    });
  });
});

// ==================== RUTAS DE CATEGORÍAS ====================

// Obtener todas las categorías
app.get('/api/categorias', (req, res) => {
  const sql = 'SELECT * FROM Categorias ORDER BY nombre_categoria';
  
  conexion.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener categorías:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    res.json({ 
      success: true, 
      data: results 
    });
  });
});

// ==================== MANEJO DE ERRORES ====================

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ Error global:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 API disponible en: http://localhost:${PORT}/api`);
  console.log(`🏠 Frontend disponible en: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});