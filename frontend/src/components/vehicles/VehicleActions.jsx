import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VehicleActions.css';

const URL_FAVORITES = 'http://localhost:8000/api/favorites/';
const URL_TESTDRIVES = 'http://localhost:8000/api/testdrives/';
const URL_PURCHASES = 'http://localhost:8000/api/purchases/';

const VehicleActions = ({ veiculo, user }) => {
    const navigate = useNavigate();
    const [favorito, setFavorito] = useState(null);
    const [podeReview, setPodeReview] = useState(false);

    useEffect(() => {
        if (!user) return;

        axios.get(URL_FAVORITES, { withCredentials: true })
            .then(response => {
                const fav = response.data.find(f => f.veiculo_detalhe.id === veiculo.id);
                if (fav) setFavorito(fav.id);
            })
            .catch(() => { });
    }, [user, veiculo.id]);

    useEffect(() => {
        if (!user) return;

        axios.get(URL_TESTDRIVES, { withCredentials: true })
            .then(response => {
                const temTestDrive = response.data.some(
                    td => td.veiculo_detalhe.id === veiculo.id && td.estado === 'concluido'
                );
                if (temTestDrive) setPodeReview(true);
            })
            .catch(() => { });

        axios.get(URL_PURCHASES, { withCredentials: true })
            .then(response => {
                const temCompra = response.data.some(
                    p => p.veiculo_detalhe.id === veiculo.id
                );
                if (temCompra) setPodeReview(true);
            })
            .catch(() => { });
    }, [user, veiculo.id]);

    if (!user) {
        return (
            <div className="va">
                <button className="va-btn va-btn-primary" onClick={() => navigate('/login')}>
                    Comprar
                </button>
                <p className="va-hint">Faça login para ver mais opções.</p>
            </div>
        );
    }

    const toggleFavorito = () => {
        if (favorito) {
            axios.delete(`${URL_FAVORITES}${favorito}/`, { withCredentials: true })
                .then(() => setFavorito(null))
                .catch(() => { });
        } else {
            axios.post(URL_FAVORITES, { veiculo: veiculo.id }, { withCredentials: true })
                .then(response => setFavorito(response.data.id))
                .catch(() => { });
        }
    };

    return (
        <div className="va">

            <button
                className="va-btn va-btn-primary"
                onClick={() => navigate(`/vehicles/${veiculo.id}/purchase`)}
                disabled={veiculo.estado === 'vendido'}
            >
                {veiculo.estado === 'vendido' ? 'Vendido' : 'Comprar'}
            </button>

            <button
                className="va-btn va-btn-secondary"
                onClick={() => navigate(`/vehicles/${veiculo.id}/testdrive`)}
                disabled={veiculo.estado === 'vendido'}
            >
                Marcar Test-Drive
            </button>

            <button
                className={`va-btn va-btn-secondary ${favorito ? 'va-btn-favorited' : ''}`}
                onClick={toggleFavorito}
            >
                {favorito ? '♥ Nos Favoritos' : '♡ Adicionar aos Favoritos'}
            </button>

            {podeReview && (
                <button
                    className="va-btn va-btn-secondary"
                    onClick={() => navigate(`/vehicles/${veiculo.id}/review`)}
                >
                    Deixar Avaliação
                </button>
            )}

        </div>
    );
};

export default VehicleActions;