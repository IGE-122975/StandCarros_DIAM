import { useState, useEffect } from 'react';
import axios from 'axios';
import './VehicleReviews.css';

const URL_REVIEWS = 'http://localhost:8000/api/reviews/';

const VehicleReviews = ({ veiculoId }) => {
    const [aberto, setAberto] = useState(false);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        axios.get(`${URL_REVIEWS}?veiculo=${veiculoId}`)
            .then(response => setReviews(response.data))
            .catch(() => { });
    }, [veiculoId]);

    const formatarData = (data) => {
        return new Date(data).toLocaleDateString('pt-PT', {
            day: '2-digit', month: '2-digit', year: 'numeric',
        });
    };

    return (
        <div className="vr">
            <button
                className="vr-toggle"
                onClick={() => setAberto(!aberto)}
            >
                Avaliações ({reviews.length}) {aberto ? '▲' : '▼'}
            </button>

            {aberto && (
                <div className="vr-list">
                    {reviews.length === 0 ? (
                        <p className="vr-empty">Ainda não há avaliações para este veículo.</p>
                    ) : (
                        reviews.map(r => (
                            <div key={r.id} className="vr-item">
                                <div className="vr-item-header">
                                    <span className="vr-item-user">{r.utilizador.username}</span>
                                    <span className="vr-item-stars">
                                        {'★'.repeat(r.classificacao)}{'☆'.repeat(5 - r.classificacao)}
                                    </span>
                                </div>
                                <p className="vr-item-text">"{r.comentario}"</p>
                                <p className="vr-item-date">{formatarData(r.criado_em)}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default VehicleReviews;