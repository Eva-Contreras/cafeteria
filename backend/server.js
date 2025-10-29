import express from 'express';
import cors from 'cors';
import { conexion } from './conexion.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permite peticiones desde cualquier origen
app.use(express.json()); // Para parsear JSON
app.use(express.static('frontend')); // Sirve archivos estáticos

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '☕ API Cafetería JAVA funcionando',
    endpoints: {
      productos: '/api/productos',
      categorias: '/api/categorias'
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
      data: results 
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
  
  const sql = `
    INSERT INTO Productos (nombre, descripcion, precio, stock, id_categoria, unidad_medida, peso_unidad, stock_minimo, stock_maximo) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  conexion.query(sql, [nombre, descripcion, precio, stock, id_categoria, unidad_medida, peso_unidad, stock_minimo, stock_maximo], (err, result) => {
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

// Actualizar stock de un producto
app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  
  const sql = 'UPDATE Productos SET stock = ? WHERE id_producto = ?';
  
  conexion.query(sql, [stock, id], (err, result) => {
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

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
});