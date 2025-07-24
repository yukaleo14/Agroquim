import React from 'react';

export default function LotesSection({
  lotes,
  selectedLote,
  setSelectedLote,
  formData,
  setFormData,
  handleLoteSubmit,
  agroquimicos,
  handleAgroquimicoChange,
  handleAddAgroquimico
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Lotes</h2>
      <select
        value={selectedLote}
        onChange={(e) => setSelectedLote(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">Seleccionar Lote</option>
        {lotes.map((lote) => (
          <option key={lote.id} value={lote.id}>
            {lote.nombre}
          </option>
        ))}
      </select>
      {selectedLote && (
        <form onSubmit={handleLoteSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Fecha</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Comentario</label>
            <textarea
              value={formData.comentario}
              onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Hectáreas</label>
            <input
              type="number"
              value={formData.hectareas}
              onChange={(e) => setFormData({ ...formData, hectareas: e.target.value })}
              className="w-full p-2 border rounded"
              min="0"
              required
            />
          </div>
          <h3 className="text-lg font-semibold mb-2">Agroquímicos</h3>
          {formData.agroquimicos.map((ag, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <select
                value={ag.nombre}
                onChange={(e) => handleAgroquimicoChange(index, 'nombre', e.target.value)}
                className="w-1/3 p-2 border rounded"
              >
                <option value="">Seleccionar Agroquímico</option>
                {agroquimicos.map((agro) => (
                  <option key={agro.id} value={agro.nombre}>
                    {agro.nombre}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={ag.cantidad}
                onChange={(e) => handleAgroquimicoChange(index, 'cantidad', e.target.value)}
                className="w-1/3 p-2 border rounded"
                placeholder="Cantidad"
                min="0"
              />
              <select
                value={ag.unidad}
                onChange={(e) => handleAgroquimicoChange(index, 'unidad', e.target.value)}
                className="w-1/3 p-2 border rounded"
              >
                <option value="litros">Litros</option>
                <option value="kilogramos">Kilogramos</option>
                <option value="dosis">Dosis</option>
                <option value="cajas">Cajas</option>
              </select>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddAgroquimico}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mb-4"
          >
            Agregar Agroquímico
          </button>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Finalizar
          </button>
        </form>
      )}
    </div>
  );
}