'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('https://practicatresbackend.onrender.com/api/usuarios');
      const usuarios = await res.json();

      const usuario = usuarios.find(
        (u: any) => u.email === email && u.password === password
      );

      if (usuario) {
        if (usuario.rol === 'admin') {
          router.push('/admin');
        } else {
          sessionStorage.setItem('usuario', JSON.stringify(usuario));
          window.dispatchEvent(new Event('sessionUpdated'));
          router.push('/');
        }
      } else {
        router.push('/registrar');
      }
    } catch (error) {
      console.error('Error al verificar usuario:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C1011] text-white p-4 font-[var(--font-geist-sans)]">
      <form
        onSubmit={handleSubmit}
        className="bg-[#171a1c] p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded mb-4 bg-[#0C1011] text-white border border-gray-600 focus:outline-none"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded mb-6 bg-[#0C1011] text-white border border-gray-600 focus:outline-none"
          required
        />

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition"
        >
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}
