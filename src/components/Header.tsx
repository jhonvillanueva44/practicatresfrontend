'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Product {
  id: number
  nombre: string
  precio: number
  imagen?: string
}

interface CartItem {
  id: number
  titulo: string
  cantidad: number
  precio: number
  imagen?: string
}

export default function Header() {
  const [showCartModal, setShowCartModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [hasCheckedUser, setHasCheckedUser] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const cartRef = useRef<HTMLDivElement>(null)
  const cartButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const checkUser = () => {
      const usuarioGuardado = sessionStorage.getItem('usuario')
      if (usuarioGuardado) {
        setUser(JSON.parse(usuarioGuardado))
      } else {
        setUser(null)
      }
      setHasCheckedUser(true)
    }

    checkUser()
    window.addEventListener('sessionUpdated', checkUser)
    window.addEventListener('cartUpdated', loadCartItems)

    return () => {
      window.removeEventListener('sessionUpdated', checkUser)
      window.removeEventListener('cartUpdated', loadCartItems)
    }
  }, [])

  const loadCartItems = () => {
    if (!user) {
      setCartItems([])
      return
    }

    const carritoId = sessionStorage.getItem('carrito_id')
    if (!carritoId) {
      setCartItems([])
      return
    }

    const fetchCarrito = fetch(`https://practicatresbackend.onrender.com/api/productos-carrito`).then(res => {
      if (!res.ok) throw new Error('Error cargando productos del carrito')
      return res.json()
    })

    const fetchProductos = fetch(`https://practicatresbackend.onrender.com/api/productos`).then(res => {
      if (!res.ok) throw new Error('Error cargando productos')
      return res.json()
    })

    Promise.all([fetchCarrito, fetchProductos])
      .then(([carritoData, productosData]: [any[], Product[]]) => {
        const filteredCarrito = carritoData.filter(
          item => item.carrito_id === Number(carritoId)
        )

        const itemsCompleto: CartItem[] = filteredCarrito.map(item => {
          const productoDetalle = productosData.find(p => p.id === item.producto_id)
          if (!productoDetalle) return null
          return {
            id: productoDetalle.id,
            titulo: productoDetalle.nombre,
            cantidad: item.cantidad,
            precio: productoDetalle.precio,
            imagen: productoDetalle.imagen,
          }
        }).filter(Boolean) as CartItem[]

        setCartItems(itemsCompleto)
      })
      .catch(err => {
        console.error('Error cargando carrito o productos:', err)
        setCartItems([])
      })
  }

  useEffect(() => {
    loadCartItems()
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cartRef.current &&
        !cartRef.current.contains(event.target as Node) &&
        !cartButtonRef.current?.contains(event.target as Node)
      ) {
        setShowCartModal(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem('usuario')
    sessionStorage.removeItem('carrito_id')
    window.dispatchEvent(new Event('sessionUpdated'))
    setUser(null)
    setCartItems([])
    window.location.href = '/'
  }

  const toggleCartModal = () => {
    setShowCartModal(prev => !prev)
    if (!showCartModal) {
      loadCartItems()
    }
  }

  const handleBuy = async () => {
    const carritoId = sessionStorage.getItem('carrito_id')
    if (!carritoId) {
      alert('No se encontró el carrito.')
      return
    }

    try {
      const res = await fetch('https://practicatresbackend.onrender.com/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrito_id: Number(carritoId) })
      })

      if (!res.ok) throw new Error('Error al realizar la compra')

      alert('¡Compra realizada con éxito!')

      window.dispatchEvent(new Event('cartUpdated'))
      setShowCartModal(false)
      window.location.href = '/'
    } catch (error) {
      console.error(error)
      alert('Hubo un problema al procesar tu compra.')
    }
  }

  if (!hasCheckedUser) return null

  return (
    <header className="bg-black text-white py-4 px-8 flex items-center justify-between shadow-md">
      <nav className="flex gap-6 text-sm font-medium">
        <Link href="/" className="hover:text-red-500">Inicio</Link>
        {!user && (
          <>
            <Link href="/registrar" className="hover:text-red-500">Registrar</Link>
            <Link href="/ingresar" className="hover:text-red-500">Ingresar</Link>
          </>
        )}
      </nav>

      {user && (
        <div className="flex items-center gap-6">
          <div className="relative">
            <button
              ref={cartButtonRef}
              onClick={toggleCartModal}
              className="relative text-white hover:text-red-500"
              aria-label="Mostrar carrito"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14l1 12H4L5 8zm7-5a3 3 0 00-3 3v1h6V6a3 3 0 00-3-3z" />
              </svg>
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.reduce((sum, item) => sum + item.cantidad, 0)}
              </span>
            </button>

            {showCartModal && (
              <div ref={cartRef} className="absolute right-0 mt-2 w-80 bg-white text-black rounded shadow-lg p-4 z-50">
                <h3 className="font-bold mb-2">Carrito</h3>
                <div className="max-h-60 overflow-y-auto text-sm">
                  {cartItems.length === 0 && <p>Tu carrito está vacío.</p>}
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b">
                      <div className="flex items-center gap-3">
                        {item.imagen && (
                          <img
                            src={item.imagen}
                            alt={item.titulo}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.titulo}</p>
                          <p className="text-gray-700">${(item.precio * item.cantidad).toFixed(2)}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">x{item.cantidad}</span>
                    </div>
                  ))}
                </div>
                {cartItems.length > 0 && (
                  <>
                    <div className="pt-3 border-t mt-3 text-sm font-bold flex justify-between">
                      <span>Total:</span>
                      <span>${cartItems.reduce((total, item) => total + item.precio * item.cantidad, 0).toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleBuy}
                      className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded"
                    >
                      Comprar
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-700 font-semibold"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  )
}
