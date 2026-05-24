import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useUserContext } from '../context/UserContext';
import './Profile.css';

const URL_PURCHASES = 'http://localhost:8000/api/purchases/';
const URL_FAVORITES = 'http://localhost:8000/api/favorites/';
const URL_TESTDRIVES = 'http://localhost:8000/api/testdrives/';
const URL_REVIEWS = 'http://localhost:8000/api/reviews/';

const Profile = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();

    const [compras, setCompras] = useState([]);
    const [favoritos, setFavoritos] = useState([]);
    const [testdrives, setTestdrives] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    useEffect(() => {
        if (!user) return;
        axios.get(URL_PURCHASES, { withCredentials: true })
            .then(response => setCompras(response.data))
            .catch(() => { });
    }, [user]);

    useEffect(() => {
        if (!user) return;
        axios.get(URL_FAVORITES, { withCredentials: true })
            .then(response => setFavoritos(response.data))
            .catch(() => { });
    }, [user]);

    useEffect(() => {
        if (!user) return;
        axios.get(URL_TESTDRIVES, { withCredentials: true })
            .then(response => setTestdrives(response.data))
            .catch(() => { });
    }, [user]);

    useEffect(() => {
        if (!user) return;
        axios.get(URL_REVIEWS, { withCredentials: true })
            .then(response => {
                const minhasReviews = response.data.filter(r => r.utilizador.username === user.username);
                setReviews(minhasReviews);
            })
            .catch(() => { });
    }, [user]);

    const agora = new Date();
    const testdrivesFuturos = testdrives
        .filter(td => new Date(td.data_hora) >= agora)
        .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
    const testdrivesAntigos = testdrives
        .filter(td => new Date(td.data_hora) < agora)
        .sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));

    const formatarData = (dataString) => {
        const d = new Date(dataString);
        return d.toLocaleString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const estadoBadge = (estado) => {
        const cores = {
            pendente: 'badge-warning',
            confirmado: 'badge-success',
            concluido: 'badge-info',
            rejeitado: 'badge-danger',
            reagendado: 'badge-warning',
        };
        return <span className={`badge ${cores[estado] || ''}`}>{estado}</span>;
    };

    return (
        <div className="profile">

            <header className="profile-header">
                <h1>Olá, {user?.username}!</h1>
                <p>Aqui pode consultar o histórico da sua conta.</p>
            </header>

            <section className="profile-section">
                <h2>Os Meus Carros ({compras.length})</h2>
                {compras.length === 0 ? (
                    <p className="profile-empty">Ainda não comprou nenhum veículo.</p>
                ) : (
                    <div className="profile-list">
                        {compras.map(compra => (
                            <Link
                                key={compra.id}
                                to={`/vehicles/${compra.veiculo_detalhe.id}`}
                                className="profile-item"
                            >
                                <div className="profile-item-info">
                                    <h3>{compra.veiculo_detalhe.marca} {compra.veiculo_detalhe.modelo}</h3>
                                    <p>{compra.veiculo_detalhe.ano} · Comprado em {formatarData(compra.data_compra)}</p>
                                </div>
                                <span className="profile-item-arrow">›</span>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section className="profile-section">
                <h2>Favoritos ({favoritos.length})</h2>
                {favoritos.length === 0 ? (
                    <p className="profile-empty">Ainda não tem favoritos.</p>
                ) : (
                    <div className="profile-list">
                        {favoritos.map(fav => (
                            <Link
                                key={fav.id}
                                to={`/vehicles/${fav.veiculo_detalhe.id}`}
                                className="profile-item"
                            >
                                <div className="profile-item-info">
                                    <h3>♥ {fav.veiculo_detalhe.marca} {fav.veiculo_detalhe.modelo}</h3>
                                    <p>{fav.veiculo_detalhe.ano} · Adicionado em {formatarData(fav.adicionado_em)}</p>
                                </div>
                                <span className="profile-item-arrow">›</span>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section className="profile-section">
                <h2>Próximos Test-Drives ({testdrivesFuturos.length})</h2>
                {testdrivesFuturos.length === 0 ? (
                    <p className="profile-empty">Não tem test-drives agendados.</p>
                ) : (
                    <div className="profile-list">
                        {testdrivesFuturos.map(td => (
                            <div key={td.id} className="profile-item">
                                <div className="profile-item-info">
                                    <h3>{td.veiculo_detalhe.marca} {td.veiculo_detalhe.modelo}</h3>
                                    <p>{formatarData(td.data_hora)}</p>
                                </div>
                                {estadoBadge(td.estado)}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="profile-section">
                <h2>Test-Drives Anteriores ({testdrivesAntigos.length})</h2>
                {testdrivesAntigos.length === 0 ? (
                    <p className="profile-empty">Sem test-drives anteriores.</p>
                ) : (
                    <div className="profile-list">
                        {testdrivesAntigos.map(td => (
                            <div key={td.id} className="profile-item">
                                <div className="profile-item-info">
                                    <h3>{td.veiculo_detalhe.marca} {td.veiculo_detalhe.modelo}</h3>
                                    <p>{formatarData(td.data_hora)}</p>
                                </div>
                                {estadoBadge(td.estado)}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="profile-section">
                <h2>As Minhas Avaliações ({reviews.length})</h2>
                {reviews.length === 0 ? (
                    <p className="profile-empty">Ainda não deixou nenhuma avaliação.</p>
                ) : (
                    <div className="profile-list">
                        {reviews.map(review => (
                            <div key={review.id} className="profile-item profile-item-review">
                                <div className="profile-item-info">
                                    <h3>{'★'.repeat(review.classificacao)}{'☆'.repeat(5 - review.classificacao)}</h3>
                                    <p className="profile-review-text">"{review.comentario}"</p>
                                    <p className="profile-review-date">{formatarData(review.criado_em)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
};

export default Profile;