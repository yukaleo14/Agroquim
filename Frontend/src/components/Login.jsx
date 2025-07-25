import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    await onLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700">Usuario</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Ingresar</button>
        </form>
        <div>
            <button
              onClick={() => navigate('/register')}
              className="text-gray-700 hover:underline"
            >
              ¿No tienes una cuenta? Regístrate
            </button>
          </div>
      </div>
    </div>
  );
}