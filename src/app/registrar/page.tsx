'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Registrar() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('https://practicatresbackend.onrender.com/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const nuevoUsuario = await res.json();
        sessionStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
        window.dispatchEvent(new Event('sessionUpdated'))
        router.push('/');
      } else {
        router.push('/registrar');
      }
    } catch (err) {
      console.error('Error al registrar:', err);
      router.push('/registrar');
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1011] text-white font-[var(--font-geist-sans)] p-8 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-[#171a1c] p-8 rounded-lg shadow-lg w-full max-w-md space-y-6"
      >
        <h1 className="text-3xl font-bold text-center">Registro de Usuario</h1>

        <div className="flex flex-col">
          <label htmlFor="nombre" className="mb-1 text-sm">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="p-2 rounded bg-[#0C1011] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 text-sm">Correo Electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="p-2 rounded bg-[#0C1011] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="password" className="mb-1 text-sm">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="p-2 rounded bg-[#0C1011] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded font-bold transition duration-200"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}
