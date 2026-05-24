import { useState, useEffect } from 'react';
import axios from 'axios';

const URL_REVIEWS = 'http://localhost:8000/api/reviews/';
const URL_VEHICLES = 'http://localhost:8000/api/vehicles/';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [veiculos, setVeiculos] = useState([]);

    const carregar = () => {
        axios.get(URL_REVIEWS).then(response => setReviews(response.data));
        axios.get(URL_VEHICLES).then(response => setVeiculos(response.data));
    };

    useEffect(() => {
        carregar();
    }, []);

    const apagar = (id) => {
        if (!window.confirm('Tem a certeza que quer apagar esta avaliação?')) return;
        axios.delete(`${URL_REVIEWS}${id}/`, { withCredentials: true })
            .then(() => carregar());
    };

        const nomeVeiculo = (veiculoId) => {
        const v = veiculos.find(v => v.id === veiculoId);
        return v ? `${v.marca} ${v.modelo}` : '—';
    };

    const formatarData = (data) => {
        return new Date(data).toLocaleString('pt-PT', {
            day: '2-digit', month: '2-digit', year: 'numeric',
        });
    };

    return (
        <div>
            <div className="admin-section-header">
                <h2>Avaliações ({reviews.length})</h2>
            </div>

            {reviews.length === 0 ? (
                <p className="admin-empty">Não há avaliações.</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Veículo</th>
                            <th>Estrelas</th>
                            <th>Comentário</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map(r => (
                            <tr key={r.id}>
                                <td>{r.utilizador.username}</td>
                                <td>{nomeVeiculo(r.veiculo)}</td>
                                <td>{'★'.repeat(r.classificacao)}{'☆'.repeat(5 - r.classificacao)}</td>
                                <td>{r.comentario}</td>
                                <td>{formatarData(r.criado_em)}</td>
                                <td>
                                    <button className="admin-btn admin-btn-danger" onClick={() => apagar(r.id)}>
                                        Apagar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminReviews;