import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import LotesSection from './components/LotesSection';
import StockSection from './components/StockSection';
import InformesSection from './components/InformesSection';
import Register from './components/Register.jsx';

function Dashboard(props) {
    return (
        <div className="container mx-auto p-4">
            <LotesSection {...props} />
            <StockSection {...props} />
            <InformesSection {...props} />
        </div>
    );
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [agroquimicos, setAgroquimicos] = useState([]);
    const [lotes, setLotes] = useState([]);
    const [selectedLote, setSelectedLote] = useState('');
    const [formData, setFormData] = useState({
        fecha: '',
        comentario: '',
        hectareas: '',
        agroquimicos: [{ nombre: '', cantidad: '', unidad: 'litros' }],
    });

    useEffect(() => {
        fetchAgroquimicos();
        fetchLotes();
    }, []);

    const fetchAgroquimicos = async () => {
        try {
            const response = await axios.get('/api/agroquimicos');
            setAgroquimicos(response.data);
        } catch (error) {
        console.error('Error al cargar agroquímicos:', error.response?.data?.error || error.message);
    }
    };

    const fetchLotes = async () => {
        try {
            const response = await axios.get('/api/lotes');
            setLotes(response.data);
        } catch (error) {
        console.error('Error al cargar lotes:', error.response?.data?.error || error.message);
    }
    };

    const handleLogin = async (username, password) => {
        try {
            const response = await axios.post('/api/login', { username, password });
            if (response.data.success) {
                setIsAuthenticated(true);
            } else {
                alert('Usuario o contraseña incorrectos');
            }
        } catch (error) {
        console.error('Error al iniciar sesión:', error.response?.data?.error || error.message);
        alert('Error al iniciar sesión');
    }
    };

    const handleAddAgroquimico = async (agroquimico) => {
        try {
            await axios.post('/api/agroquimicos', agroquimico);
            fetchAgroquimicos();
        } catch (error) {
            alert('Error al agregar agroquímico');
        }
    };

    const handleEditAgroquimico = async (id, updatedAgroquimico) => {
        try {
            await axios.put(`/api/agroquimicos/${id}`, updatedAgroquimico);
            fetchAgroquimicos();
        } catch (error) {
            alert('Error al editar agroquímico');
        }
    };

    const handleDeleteAgroquimico = async (id) => {
        try {
            await axios.delete(`/api/agroquimicos/${id}`);
            fetchAgroquimicos();
        } catch (error) {
            alert('Error al eliminar agroquímico');
        }
    };

    const handleLoteSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/lotes', {
                loteId: selectedLote,
                ...formData,
            });
            setFormData({
                fecha: '',
                comentario: '',
                hectareas: '',
                agroquimicos: [{ nombre: '', cantidad: '', unidad: 'litros' }],
            });
            fetchAgroquimicos();
        } catch (error) {
            alert('Error al registrar lote');
        }
    };

    const handleAgroquimicoChange = (index, field, value) => {
        const updated = [...formData.agroquimicos];
        updated[index][field] = value;
        setFormData({ ...formData, agroquimicos: updated });
    };

    const handleAddAgroquimicoToForm = () => {
        setFormData({
            ...formData,
            agroquimicos: [
                ...formData.agroquimicos,
                { nombre: '', cantidad: '', unidad: 'litros' },
            ],
        });
    };

    const generatePDF = (loteId, startDate, endDate) => {
        // Aquí va la lógica para generar el PDF usando jsPDF
    };

    const dashboardProps = {
        lotes,
        selectedLote,
        setSelectedLote,
        formData,
        setFormData,
        handleLoteSubmit,
        agroquimicos,
        handleAgroquimicoChange,
        handleAddAgroquimico: handleAddAgroquimicoToForm,
        onAdd: handleAddAgroquimico,
        onEdit: handleEditAgroquimico,
        onDelete: handleDeleteAgroquimico,
        generatePDF,
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <Dashboard {...dashboardProps} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/login"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/" />
                        ) : (
                            <Login onLogin={handleLogin} />
                        )
                    }
                />
                <Route
                    path="/register"
                    element={<Register />}
                />
                <Route
                    path="/dashboard"
                    element={
                        isAuthenticated ? (
                            <Dashboard {...dashboardProps} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;