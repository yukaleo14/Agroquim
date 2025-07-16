const { useState, useEffect } = React;
import { fetchLotes, fetchAgroquimicos, handleLogin, handleLoteSubmit, handleStockSubmit, handleEditAgroquimico, handleDeleteAgroquimico, generatePDF } from '../utils/api.js';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentSection, setCurrentSection] = useState('lotes');
  const [lotes, setLotes] = useState([]);
  const [selectedLote, setSelectedLote] = useState('');
  const [agroquimicos, setAgroquimicos] = useState([]);
  const [formData, setFormData] = useState({
    fecha: '',
    comentario: '',
    hectareas: '',
    agroquimicos: [{ nombre: '', cantidad: '', unidad: 'litros' }],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLotes(setLotes, setIsLoading);
    fetchAgroquimicos(setAgroquimicos, setIsLoading);
  }, []);

  const handleAddAgroquimico = () => {
    setFormData({
      ...formData,
      agroquimicos: [...formData.agroquimicos, { nombre: '', cantidad: '', unidad: 'litros' }],
    });
  };

  const handleAgroquimicoChange = (index, field, value) => {
    const newAgroquimicos = [...formData.agroquimicos];
    newAgroquimicos[index][field] = field === 'cantidad' ? Math.max(0, value) : value;
    setFormData({ ...formData, agroquimicos: newAgroquimicos });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>
          <form onSubmit={(e) => handleLogin(e, username, password, setIsAuthenticated)}>
            <div className="mb-4">
              <label className="block text-gray-700">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {isLoading && <div className="text-center">Cargando...</div>}
      <nav className="bg-blue-500 text-white p-4 rounded mb-4">
        <ul className="flex space-x-4">
          <li>
            <button onClick={() => setCurrentSection('lotes')} className="hover:underline">
              Lotes
            </button>
          </li>
          <li>
            <button onClick={() => setCurrentSection('stock')} className="hover:underline">
              Stock
            </button>
          </li>
          <li>
            <button onClick={() => setCurrentSection('informes')} className="hover:underline">
              Informes
            </button>
          </li>
        </ul>
      </nav>

      {currentSection === 'lotes' && (
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
            <form onSubmit={(e) => handleLoteSubmit(e, formData, selectedLote, setFormData, fetchAgroquimicos, setAgroquimicos, setIsLoading)}>
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
      )}

      {currentSection === 'stock' && (
        <StockSection
          agroquimicos={agroquimicos}
          onAdd={(agroquimico) => handleStockSubmit(agroquimico, fetchAgroquimicos, setAgroquimicos, setIsLoading)}
          onEdit={(id, updatedAgroquimico) => handleEditAgroquimico(id, updatedAgroquimico, fetchAgroquimicos, setAgroquimicos, setIsLoading)}
          onDelete={(id) => handleDeleteAgroquimico(id, fetchAgroquimicos, setAgroquimicos, setIsLoading)}
        />
      )}

      {currentSection === 'informes' && (
        <InformesSection lotes={lotes} generatePDF={generatePDF} />
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);