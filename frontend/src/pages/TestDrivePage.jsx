import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FormPage.css';

const URL_VEHICLES = 'http://localhost:8000/api/vehicles/';
const URL_TESTDRIVES = 'http://localhost:8000/api/testdrives/';

const TestDrivePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [veiculo, setVeiculo] = useState(null);
    const [dataHora, setDataHora] = useState('');
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState(false);

    useEffect(() => {
        axios.get(`${URL_VEHICLES}${id}/`)
            .then(response => setVeiculo(response.data))
            .catch(() => setErro('Veículo não encontrado.'));
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErro('');

        axios.post(URL_TESTDRIVES, {
            veiculo: parseInt(id),
            data_hora: dataHora
        }, { withCredentials: true })
            .then(() => {
                setSucesso(true);
                setTimeout(() => navigate('/'), 2000);
            })
            .catch(err => {
                const msg = err.response?.data?.msg || 'Erro ao agendar test-drive.';
                setErro(msg);
            });
    };

    if (!veiculo) return <p className="form-loading">A carregar...</p>;

    if (sucesso) {
        return (
            <div className="form-page">
                <div className="form-card form-success">
                    <h2>Test-drive agendado!</h2>
                    <p>Receberá um email assim que o pedido for confirmado pelo staff.</p>
                </div>
            </div>
        );
    }

    const hoje = new Date().toISOString().slice(0, 16);

    return (
        <div className="form-page">
            <div className="form-card">
                <h2 className="form-title">Marcar Test-Drive</h2>
                <p className="form-subtitle">
                    {veiculo.marca} {veiculo.modelo} ({veiculo.ano})
                </p>

                <form onSubmit={handleSubmit} className="form-body">

                    <div className="form-field">
                        <label>Data e hora pretendida</label>
                        <input
                            type="datetime-local"
                            min={hoje}
                            value={dataHora}
                            onChange={(e) => setDataHora(e.target.value)}
                            required
                        />
                    </div>

                    <p className="form-info">
                        O pedido será analisado pelo staff. Receberá um email com a confirmação.
                    </p>

                    {erro && <p className="form-error">{erro}</p>}

                    <div className="form-actions">
                        <button type="button" className="form-btn form-btn-secondary" onClick={() => navigate(-1)}>
                            Cancelar
                        </button>
                        <button type="submit" className="form-btn form-btn-primary">
                            Pedir Test-Drive
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TestDrivePage;