'use client'

import { useState, useEffect } from 'react'

interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  imagen: string
  stock: number
}

export default function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
  })

  // Cargar productos
  useEffect(() => {
    setLoading(true)
    fetch('https://practicatresbackend.onrender.com/api/productos')
      .then(res => {
        if (!res.ok) throw new Error('Error cargando productos')
        return res.json()
      })
      .then(data => {
        const productosConPrecioNum = data.map((p: Producto) => ({
          ...p,
          precio: Number(p.precio),
        }))
        setProductos(productosConPrecioNum)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'precio' || name === 'stock' ? Number(value) : value,
    }))
  }

  const openCreateForm = () => {
    setFormData({ nombre: '', descripcion: '', precio: 0, stock: 0 })
    setIsEditing(false)
    setEditId(null)
    setShowForm(true)
  }

  const openEditForm = (producto: Producto) => {
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
    })
    setEditId(producto.id)
    setIsEditing(true)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      alert('El nombre es obligatorio')
      return
    }

    try {
      setLoading(true)

      const res = await fetch(`https://practicatresbackend.onrender.com/api/productos${isEditing ? `/${editId}` : ''}`, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error(isEditing ? 'Error al actualizar' : 'Error al crear producto')

      const productoActualizado = await res.json()

      setProductos(prev =>
        isEditing
          ? prev.map(p => (p.id === editId ? { ...productoActualizado, precio: Number(productoActualizado.precio) } : p))
          : [...prev, { ...productoActualizado, precio: Number(productoActualizado.precio) }]
      )

      setShowForm(false)
      setFormData({ nombre: '', descripcion: '', precio: 0, stock: 0 })
      setEditId(null)
      setIsEditing(false)
    } catch (err: any) {
      alert(err.message || 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    const confirm = window.confirm('¿Estás seguro de eliminar este producto?')
    if (!confirm) return

    try {
      setLoading(true)
      const res = await fetch(`https://practicatresbackend.onrender.com/api/productos/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Error al eliminar producto')

      setProductos(prev => prev.filter(p => p.id !== id))
    } catch (err: any) {
      alert(err.message || 'Error eliminando')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <h1 className="text-4xl font-bold mb-8">Administrar Productos</h1>

      <button
        onClick={openCreateForm}
        className="mb-6 bg-red-600 hover:bg-red-700 transition px-6 py-2 rounded font-semibold"
        disabled={loading}
      >
        + Nuevo Producto
      </button>

      {loading && <p>Cargando productos...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!loading && !error && (
        <table className="w-full border-collapse table-auto text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-3">Imagen</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Descripción</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-800 transition">
                <td className="p-3">
                  <img
                    src={p.imagen || 'https://via.placeholder.com/80'}
                    alt={p.nombre}
                    className="w-20 h-20 object-cover rounded"
                  />
                </td>
                <td className="p-3">{p.nombre}</td>
                <td className="p-3">{p.descripcion}</td>
                <td className="p-3">${p.precio.toFixed(2)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => openEditForm(p)}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-sm"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-6 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-lg space-y-4"
          >
            <h2 className="text-2xl font-bold mb-4">
              {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>

            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
            <textarea
              name="descripcion"
              placeholder="Descripción"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-red-600"
              rows={3}
            />
            <input
              type="number"
              name="precio"
              placeholder="Precio"
              value={formData.precio || ''}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
            <input
              type="number"
              name="stock"
              placeholder="Stock"
              value={formData.stock || ''}
              onChange={handleChange}
              min="0"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-red-600 rounded hover:bg-red-700 transition font-semibold"
                disabled={loading}
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
