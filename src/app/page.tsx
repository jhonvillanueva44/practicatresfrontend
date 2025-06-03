'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProductCard from '../components/ProductCard'

interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  imagen: string
}

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    fetch('https://practicatresbackend.onrender.com/api/productos')
      .then(res => {
        if (!res.ok) throw new Error('Error cargando productos')
        return res.json()
      })
      .then(data => {
        const productosConPrecio = data.map((p: any) => ({
          ...p,
          precio: Number(p.precio),
        }))
        setProductos(productosConPrecio)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const usuarioStr = sessionStorage.getItem('usuario')
    if (!usuarioStr) return

    const usuario = JSON.parse(usuarioStr)

    fetch('https://practicatresbackend.onrender.com/api/carritos')
      .then(res => {
        if (!res.ok) throw new Error('Error obteniendo carritos')
        return res.json()
      })
      .then(carritos => {
        const carritoDelUsuario = carritos.find(
          (carrito: any) => carrito.usuario_id === usuario.id
        )
        if (carritoDelUsuario) {
          sessionStorage.setItem('carrito_id', carritoDelUsuario.id.toString())
          console.log('Carrito ID guardado:', carritoDelUsuario.id)
        }
      })
      .catch(err => {
        console.error('Error al buscar el carrito del usuario:', err)
      })
  }, [])

  const handleAddToCart = async (productoId: number) => {
    const usuarioStr = sessionStorage.getItem('usuario')
    if (!usuarioStr) {
      router.push('/registrar')
      return
    }

    const carritoIdStr = sessionStorage.getItem('carrito_id')
    if (!carritoIdStr) {
      alert('No se encontró carrito para este usuario.')
      return
    }

    try {
      const res = await fetch('https://practicatresbackend.onrender.com/api/productos-carrito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrito_id: Number(carritoIdStr),
          producto_id: productoId,
          cantidad: 1,
        }),
      })

      if (!res.ok) throw new Error('Error agregando producto al carrito')

      window.location.reload()

    } catch (error) {
      console.error(error)
      alert('No se pudo agregar el producto al carrito.')
    }
  }

  return (
    <div className="min-h-screen p-8 bg-[#0C1011] text-white font-[var(--font-geist-sans)]">
      <h1 className="text-3xl font-bold mb-8 text-center">Nuestros Productos</h1>

      {loading && <p>Cargando productos...</p>}
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {productos.map(producto => (
            <ProductCard
              key={producto.id}
              id={producto.id}
              nombre={producto.nombre}
              descripcion={producto.descripcion}
              precio={producto.precio}
              imagen={producto.imagen}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  )
}
