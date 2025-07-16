const InformesSection = ({ lotes, generatePDF }) => {
  const [selectedLote, setSelectedLote] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [informes, setInformes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedLote) {
      fetchInformes(selectedLote, setInformes, setIsLoading);
    }
  }, [selectedLote]);

  const fetchInformes = async (loteId, setInformes, setIsLoading) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/informes?loteId=${loteId}`);
      setInformes(response.data);
    } catch (error) {
      console.error('Error fetching informes:', error);
      alert('Error al cargar los informes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Informes</h2>
      {isLoading && <div className="text-center">Cargando...</div>}
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
      <div className="flex space-x-2 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          onClick={() => generatePDF(selectedLote, startDate, endDate)}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={!selectedLote}
        >
          Descargar Informe
        </button>
        <button
          onClick={() => generatePDF('', startDate, endDate)}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Descargar Todos los Lotes
        </button>
      </div>
      {selectedLote && informes.length > 0 && (
        <>
          {informes.map((informe, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-semibold">{informe.nombre}</h3>
              <table className="w-full border-collapse border">
                <thead>
                  <tr>
                    <th className="border p-2">Fecha</th>
                    <th className="border p-2">Comentario</th>
                    <th className="border p-2">Hectáreas</th>
                    <th className="border p-2">Agroquímicos</th>
                  </tr>
                </thead>
                <tbody>
                  {informe.registros
                    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                    .map((registro, i) => (
                      <tr key={i}>
                        <td className="border p-2">{registro.fecha}</td>
                        <td className="border p-2">{registro.comentario || 'Sin comentario'}</td>
                        <td className="border p-2">{registro.hectareas}</td>
                        <td className="border p-2">
                          {registro.agroquimicos.map((ag, j) => (
                            <div key={j}>
                              {ag.nombre}: {ag.cantidad} {ag.unidad}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}
    </div>
  );
};