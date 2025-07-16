const fetchLotes = async (setLotes, setIsLoading) => {
  setIsLoading(true);
  try {
    const response = await axios.get('/api/lotes');
    setLotes(response.data);
  } catch (error) {
    console.error('Error fetching lotes:', error);
    alert('Error al cargar los lotes');
  } finally {
    setIsLoading(false);
  }
};

const fetchAgroquimicos = async (setAgroquimicos, setIsLoading) => {
  setIsLoading(true);
  try {
    const response = await axios.get('/api/agroquimicos');
    setAgroquimicos(response.data);
  } catch (error) {
    console.error('Error fetching agroquimicos:', error);
    alert('Error al cargar los agroquímicos');
  } finally {
    setIsLoading(false);
  }
};

const handleLogin = async (e, username, password, setIsAuthenticated) => {
  e.preventDefault();
  try {
    const response = await axios.post('/api/login', { username, password });
    if (response.data.success) {
      setIsAuthenticated(true);
    } else {
      alert('Credenciales incorrectas');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    alert('Error en el servidor');
  }
};

const handleLoteSubmit = async (e, formData, selectedLote, setFormData, fetchAgroquimicos, setAgroquimicos, setIsLoading) => {
  e.preventDefault();
  if (formData.hectareas < 0) {
    alert('Las hectáreas no pueden ser negativas');
    return;
  }
  try {
    await axios.post('/api/lotes', { ...formData, loteId: selectedLote });
    alert('Lote registrado exitosamente');
    setFormData({
      fecha: '',
      comentario: '',
      hectareas: '',
      agroquimicos: [{ nombre: '', cantidad: '', unidad: 'litros' }],
    });
    fetchAgroquimicos(setAgroquimicos, setIsLoading);
  } catch (error) {
    console.error('Error saving lote:', error);
    alert('Error al registrar el lote');
  }
};

const handleStockSubmit = async (agroquimico, fetchAgroquimicos, setAgroquimicos, setIsLoading) => {
  if (agroquimico.cantidad < 0) {
    alert('La cantidad no puede ser negativa');
    return;
  }
  try {
    await axios.post('/api/agroquimicos', agroquimico);
    fetchAgroquimicos(setAgroquimicos, setIsLoading);
    alert('Agroquímico agregado exitosamente');
  } catch (error) {
    console.error('Error adding agroquimico:', error);
    alert('Error al agregar agroquímico');
  }
};

const handleEditAgroquimico = async (id, updatedAgroquimico, fetchAgroquimicos, setAgroquimicos, setIsLoading) => {
  if (updatedAgroquimico.cantidad < 0) {
    alert('La cantidad no puede ser negativa');
    return;
  }
  try {
    await axios.put(`/api/agroquimicos/${id}`, updatedAgroquimico);
    fetchAgroquimicos(setAgroquimicos, setIsLoading);
    alert('Agroquímico actualizado exitosamente');
  } catch (error) {
    console.error('Error updating agroquimico:', error);
    alert('Error al actualizar agroquímico');
  }
};

const handleDeleteAgroquimico = async (id, fetchAgroquimicos, setAgroquimicos, setIsLoading) => {
  if (!confirm('¿Estás seguro de eliminar este agroquímico?')) return;
  try {
    await axios.delete(`/api/agroquimicos/${id}`);
    fetchAgroquimicos(setAgroquimicos, setIsLoading);
    alert('Agroquímico eliminado exitosamente');
  } catch (error) {
    console.error('Error deleting agroquimico:', error);
    alert('Error al eliminar agroquímico');
  }
};

const generatePDF = async (loteId, startDate, endDate) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  try {
    const response = await axios.get(`/api/informes?loteId=${loteId}&startDate=${startDate}&endDate=${endDate}`);
    const data = response.data;

    if (!data.length) {
      alert('No hay datos para generar el informe');
      return;
    }

    data.forEach((lote, index) => {
      if (index > 0) doc.addPage();
      doc.text(`Informe del Lote: ${lote.nombre}`, 10, 10);
      let y = 20;
      lote.registros.forEach((registro) => {
        doc.text(`Fecha: ${registro.fecha}`, 10, y);
        doc.text(`Comentario: ${registro.comentario || 'Sin comentario'}`, 10, y + 10);
        doc.text(`Hectáreas: ${registro.hectareas}`, 10, y + 20);
        doc.text('Agroquímicos:', 10, y + 30);
        registro.agroquimicos.forEach((ag, i) => {
          doc.text(`${ag.nombre}: ${ag.cantidad} ${ag.unidad}`, 20, y + 40 + i * 10);
        });
        y += 50 + registro.agroquimicos.length * 10;
      });
    });

    doc.save(`informe_lote_${loteId || 'todos'}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error al generar el informe');
  }
};