import React, { useState } from 'react';

export default function StockSection({ agroquimicos, onAdd, onEdit, onDelete }) {
  const [newAgroquimico, setNewAgroquimico] = useState({ nombre: '', cantidad: '', unidad: 'litros' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: '', cantidad: '', unidad: 'litros' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(newAgroquimico);
    setNewAgroquimico({ nombre: '', cantidad: '', unidad: 'litros' });
  };

  const handleEdit = (agroquimico) => {
    setEditingId(agroquimico.id);
    setEditForm(agroquimico);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onEdit(editingId, editForm);
    setEditingId(null);
    setEditForm({ nombre: '', cantidad: '', unidad: 'litros' });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Stock</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newAgroquimico.nombre}
            onChange={(e) => setNewAgroquimico({ ...newAgroquimico, nombre: e.target.value })}
            className="w-1/3 p-2 border rounded"
            placeholder="Nombre del agroquímico"
            required
          />
          <input
            type="number"
            value={newAgroquimico.cantidad}
            onChange={(e) =>
              setNewAgroquimico({ ...newAgroquimico, cantidad: Math.max(0, e.target.value) })
            }
            className="w-1/3 p-2 border rounded"
            placeholder="Cantidad"
            min="0"
            required
          />
          <select
            value={newAgroquimico.unidad}
            onChange={(e) => setNewAgroquimico({ ...newAgroquimico, unidad: e.target.value })}
            className="w-1/3 p-2 border rounded"
          >
            <option value="litros">Litros</option>
            <option value="kilogramos">Kilogramos</option>
            <option value="dosis">Dosis</option>
            <option value="cajas">Cajas</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mt-2"
        >
          Agregar Agroquímico
        </button>
      </form>
      <div>
        {[...agroquimicos]
          .sort((a, b) => a.nombre.localeCompare(b.nombre))
          .map((agroquimico) => (
            <div key={agroquimico.id} className="flex items-center justify-between p-2 border-b">
              {editingId === agroquimico.id ? (
                <form onSubmit={handleEditSubmit} className="flex space-x-2">
                  <input
                    type="text"
                    value={editForm.nombre}
                    onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                    className="w-1/3 p-2 border rounded"
                    required
                  />
                  <input
                    type="number"
                    value={editForm.cantidad}
                    onChange={(e) =>
                      setEditForm({ ...editForm, cantidad: Math.max(0, e.target.value) })
                    }
                    className="w-1/3 p-2 border rounded"
                    min="0"
                    required
                  />
                  <select
                    value={editForm.unidad}
                    onChange={(e) => setEditForm({ ...editForm, unidad: e.target.value })}
                    className="w-1/3 p-2 border rounded"
                  >
                    <option value="litros">Litros</option>
                    <option value="kilogramos">Kilogramos</option>
                    <option value="dosis">Dosis</option>
                    <option value="cajas">Cajas</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <>
                  <span>
                    {agroquimico.nombre}: {agroquimico.cantidad} {agroquimico.unidad}
                  </span>
                  <div>
                    <button
                      onClick={() => handleEdit(agroquimico)}
                      className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(agroquimico.id)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}