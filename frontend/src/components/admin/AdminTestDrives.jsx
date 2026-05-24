import { useState, useEffect } from 'react';
import axios from 'axios';

const URL_TESTDRIVES = 'http://localhost:8000/api/testdrives/';

const AdminTestDrives = () => {
    const [testdrives, setTestdrives] = useState([]);
    const [reagendandoId, setReagendandoId] = useState(null);
    const [novaData, setNovaData] = useState('');

    const carregar = () => {
        axios.get(URL_TESTDRIVES, { withCredentials: true })
            .then(response => setTestdrives(response.data));
    };

    useEffect(() => {
        carregar();
    }, []);

    const mudarEstado = (id, novoEstado) => {
        axios.put(`${URL_TESTDRIVES}${id}/`, { estado: novoEstado }, { withCredentials: true })
            .then(() => {
                setTestdrives(prev => prev.map(td =>
                    td.id === id ? { ...td, estado: novoEstado } : td
                ));
            })
            .catch(err => console.log('Erro:', err));
    };

    const reagendar = (id) => {
        if (!novaData) {
            alert('Escolha uma nova data primeiro.');
            return;
        }
        axios.put(`${URL_TESTDRIVES}${id}/`, {
            estado: 'reagendado',
            data_hora: novaData
        }, { withCredentials: true })
            .then(() => {
                setTestdrives(prev => prev.map(td =>
                    td.id === id ? { ...td, estado: 'reagendado', data_hora: novaData } : td
                ));
                setReagendandoId(null);
                setNovaData('');
            })
            .catch(err => console.log('Erro:', err));
    };

    const formatarData = (data) => {
        return new Date(data).toLocaleString('pt-PT', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const hoje = new Date().toISOString().slice(0, 16);

    return (
        <div>
            <div className="admin-section-header">
                <h2>Test-Drives ({testdrives.length})</h2>
            </div>

            {testdrives.length === 0 ? (
                <p className="admin-empty">Não há test-drives.</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Veículo</th>
                            <th>Data</th>
                            <th>Estado</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {testdrives.map(td => (
                            <tr key={td.id}>
                                <td>{td.utilizador.username}</td>
                                <td>{td.veiculo_detalhe.marca} {td.veiculo_detalhe.modelo}</td>
                                <td>{formatarData(td.data_hora)}</td>
                                <td>{td.estado}</td>
                                <td>
                                    {reagendandoId === td.id ? (
                                        <div className="admin-actions">
                                            <input
                                                type="datetime-local"
                                                min={hoje}
                                                value={novaData}
                                                onChange={(e) => setNovaData(e.target.value)}
                                            />
                                            <button className="admin-btn admin-btn-success" onClick={() => reagendar(td.id)}>
                                                Confirmar
                                            </button>
                                            <button className="admin-btn admin-btn-secondary" onClick={() => {
                                                setReagendandoId(null);
                                                setNovaData('');
                                            }}>
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="admin-actions">
                                            {td.estado === 'pendente' && (
                                                <>
                                                    <button className="admin-btn admin-btn-success" onClick={() => mudarEstado(td.id, 'confirmado')}>
                                                        Confirmar
                                                    </button>
                                                    <button className="admin-btn admin-btn-danger" onClick={() => mudarEstado(td.id, 'rejeitado')}>
                                                        Rejeitar
                                                    </button>
                                                    <button className="admin-btn admin-btn-secondary" onClick={() => setReagendandoId(td.id)}>
                                                        Reagendar
                                                    </button>
                                                </>
                                            )}
                                            {td.estado === 'confirmado' && (
                                                <>
                                                    <button className="admin-btn admin-btn-primary" onClick={() => mudarEstado(td.id, 'concluido')}>
                                                        Marcar Concluído
                                                    </button>
                                                    <button className="admin-btn admin-btn-secondary" onClick={() => setReagendandoId(td.id)}>
                                                        Reagendar
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminTestDrives;