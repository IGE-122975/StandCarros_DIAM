import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FormPage.css';

const URL_VEHICLES = 'http://localhost:8000/api/vehicles/';
const URL_REVIEWS = 'http://localhost:8000/api/reviews/';

const ReviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [veiculo, setVeiculo] = useState(null);
    const [classificacao, setClassificacao] = useState(5);
    const [comentario, setComentario] = useState('');
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

        axios.post(URL_REVIEWS, {
            veiculo: parseInt(id),
            classificacao: classificacao,
            comentario: comentario
        }, { withCredentials: true })
            .then(() => {
                setSucesso(true);
                setTimeout(() => navigate(`/vehicles/${id}`), 2000);
            })
            .catch(err => {
                const msg = err.response?.data?.msg
                    || err.response?.data?.detail
                    || 'Erro ao submeter avaliação.';
                setErro(msg);
            });
    };

    if (!veiculo) return <p className="form-loading">A carregar...</p>;

    if (sucesso) {
        return (
            <div className="form-page">
                <div className="form-card form-success">
                    <h2>Avaliação submetida!</h2>
                    <p>Obrigado pelo seu feedback.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="form-page">
            <div className="form-card">
                <h2 className="form-title">Deixar Avaliação</h2>
                <p className="form-subtitle">
                    {veiculo.marca} {veiculo.modelo} ({veiculo.ano})
                </p>

                <form onSubmit={handleSubmit} className="form-body">

                    <div className="form-field">
                        <label>Classificação</label>
                        <div className="form-stars">
                            {[1, 2, 3, 4, 5].map(n => (
                                <button
                                    key={n}
                                    type="button"
                                    className={`form-star ${n <= classificacao ? 'form-star-active' : ''}`}
                                    onClick={() => setClassificacao(n)}
                                >
                                    ★
                                </button>
                            ))}
                            <span className="form-stars-value">{classificacao}/5</span>
                        </div>
                    </div>

                    <div className="form-field">
                        <label>Comentário</label>
                        <textarea
                            rows="5"
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            placeholder="Partilhe a sua experiência com este veículo..."
                            required
                        />
                    </div>

                    {erro && <p className="form-error">{erro}</p>}

                    <div className="form-actions">
                        <button type="button" className="form-btn form-btn-secondary" onClick={() => navigate(-1)}>
                            Cancelar
                        </button>
                        <button type="submit" className="form-btn form-btn-primary">
                            Submeter Avaliação
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewPage;