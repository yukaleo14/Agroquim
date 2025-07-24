import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('/api/register', { username, password });
      if (response.data.success) {
        setMessage('Usuario registrado correctamente');
        setUsername('');
        setPassword('');
      } else {
        setMessage(response.data.error || 'No se pudo registrar el usuario');
      }
    } catch (error) {
      console.error('Error en registro:', error.response?.data?.error || error.message);
      setMessage(error.response?.data?.error || 'Error al registrar usuario');
    }
  };

  return (
    <div className="flex justify-center mb-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Registrar Nuevo Usuario</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-700">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Registrar
          </button>
        </form>
        {message && <div className="mt-2 text-center text-sm">{message}</div>}
      </div>
    </div>
  );
}