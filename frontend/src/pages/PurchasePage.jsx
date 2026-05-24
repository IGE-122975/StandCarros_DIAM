import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FormPage.css';

const URL_VEHICLES = 'http://localhost:8000/api/vehicles/';
const URL_PURCHASES = 'http://localhost:8000/api/purchases/';

const PurchasePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [veiculo, setVeiculo] = useState(null);
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

        axios.post(URL_PURCHASES, { veiculo: parseInt(id) }, { withCredentials: true })
            .then(() => {
                setSucesso(true);
                setTimeout(() => navigate('/'), 2000);
            })
            .catch(err => {
                const msg = err.response?.data?.msg || 'Erro ao processar compra.';
                setErro(msg);
            });
    };

    if (!veiculo) return <p className="form-loading">A carregar...</p>;

    if (sucesso) {
        return (
            <div className="form-page">
                <div className="form-card form-success">
                    <h2>Compra registada com sucesso!</h2>
                    <p>Em breve será contactado pelo nosso staff.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="form-page">
            <div className="form-card">
                <h2 className="form-title">Confirmar Compra</h2>
                <p className="form-subtitle">
                    {veiculo.marca} {veiculo.modelo} ({veiculo.ano})
                </p>

                <div className="form-summary">
                    <div className="form-summary-row">
                        <span>Veículo</span>
                        <span>{veiculo.marca} {veiculo.modelo}</span>
                    </div>
                    <div className="form-summary-row">
                        <span>Ano</span>
                        <span>{veiculo.ano}</span>
                    </div>
                    <div className="form-summary-row form-summary-total">
                        <span>Preço</span>
                        <span>{parseFloat(veiculo.preco).toLocaleString('pt-PT')} €</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="form-body">
                    <p className="form-info">
                        Ao confirmar, o pedido de compra será enviado ao staff para finalização.
                    </p>

                    {erro && <p className="form-error">{erro}</p>}

                    <div className="form-actions">
                        <button type="button" className="form-btn form-btn-secondary" onClick={() => navigate(-1)}>
                            Cancelar
                        </button>
                        <button type="submit" className="form-btn form-btn-primary">
                            Confirmar Compra
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PurchasePage;