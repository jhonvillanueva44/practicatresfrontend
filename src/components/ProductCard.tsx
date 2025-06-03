interface ProductCardProps {
  id: number
  nombre: string
  descripcion: string
  precio: number
  imagen: string
  onAddToCart: (id: number) => void
}

export default function ProductCard({
  id,
  nombre,
  descripcion,
  precio,
  imagen,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div className="bg-[#171a1c] rounded-lg p-6 shadow-lg flex flex-col items-center">
      {imagen ? (
        <img
          src={imagen}
          alt={nombre}
          className="w-full h-48 object-contain mb-4 rounded"
        />
      ) : (
        <div className="w-full h-48 bg-gray-700 flex items-center justify-center mb-4 rounded text-gray-400 text-sm">
          Sin imagen
        </div>
      )}
      <h2 className="text-xl font-semibold mb-2 text-center">{nombre}</h2>
      <p className="text-gray-300 mb-4 text-center">{descripcion}</p>
      <span className="font-bold text-red-500 text-lg mb-4">${precio.toFixed(2)}</span>

      <button
        onClick={() => onAddToCart(id)}
        className="bg-red-600 hover:bg-red-700 transition-colors text-white px-4 py-2 rounded w-full"
      >
        Añadir al carrito
      </button>
    </div>
  )
}
