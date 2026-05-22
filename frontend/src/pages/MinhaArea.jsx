import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/pt';
import {
    Container, Row, Col, Card, CardBody,
    Badge, Button, Table
} from 'reactstrap';
import { getCSRFToken } from '../utils/csrf';

moment.locale('pt');

const COR_ESTADO = {
    pendente: 'warning',
    confirmado: 'success',
    concluido: 'info',
    rejeitado: 'danger',
    reagendado: 'secondary',
};

const LABEL_ESTADO = {
    pendente: 'Pendente',
    confirmado: 'Confirmado',
    concluido: 'Concluído',
    rejeitado: 'Rejeitado',
    reagendado: 'Reagendado',
};

export default function MinhaArea() {
    const username = localStorage.getItem('username');

    const [testDrives, setTestDrives] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loadingTD, setLoadingTD] = useState(true);
    const [loadingRev, setLoadingRev] = useState(true);
    const [mensagem, setMensagem] = useState('');

    // Carrega os test-drives do utilizador autenticado
    useEffect(() => {
        axios.get('api/testdrives/')
            .then(res => {
                setTestDrives(res.data);
                setLoadingTD(false);
            })
            .catch(() => setLoadingTD(false));
    }, []);

    // Carrega as reviews e filtra as do utilizador actual
    useEffect(() => {
        axios.get('api/reviews/')
            .then(res => {
                const minhas = res.data.filter(r => r.utilizador.username === username);
                setReviews(minhas);
                setLoadingRev(false);
            })
            .catch(() => setLoadingRev(false));
    }, [username]);

    // Elimina uma review pelo seu ID
    const eliminarReview = async (reviewId) => {
        try {
            await axios.delete(`api/reviews/${reviewId}/`, {
                headers: { 'X-CSRFToken': getCSRFToken() },
            });
            setReviews(prev => prev.filter(r => r.id !== reviewId));
            setMensagem('Avaliação eliminada com sucesso.');
        } catch (err) {
            setMensagem('Erro ao eliminar avaliação.');
        }
    };

    return (
        <Container className="my-4">
            <h2 className="mb-4">A Minha Área</h2>
            <p className="text-muted mb-4">Bem-vindo/a, <strong>{username}</strong>.</p>

            {/* ── Secção de Test-Drives ──────────────────────────────────── */}
            <h4 className="mb-3">Os Meus Test-Drives</h4>

            {loadingTD ? (
                <p>A carregar...</p>
            ) : testDrives.length === 0 ? (
                <p className="text-muted">Ainda não tens nenhum test-drive agendado.</p>
            ) : (
                <Row className="mb-5">
                    {testDrives.map(td => {
                        const v = td.veiculo_detalhe;
                        return (
                            <Col xs="12" md="6" lg="4" className="mb-3" key={td.id}>
                                <Card className="shadow-sm border-0 h-100">
                                    <CardBody>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <strong className="text-dark">
                                                {v ? `${v.marca} ${v.modelo}` : `Veículo #${td.veiculo}`}
                                            </strong>
                                            <Badge color={COR_ESTADO[td.estado] || 'secondary'}>
                                                {LABEL_ESTADO[td.estado] || td.estado}
                                            </Badge>
                                        </div>

                                        {/* moment.js formata a data/hora de forma legível */}
                                        <p className="text-muted small mb-2">
                                            {moment(td.data_hora).format('D [de] MMMM [de] YYYY, HH:mm')}
                                        </p>

                                        {v && (
                                            <Link
                                                to={`/veiculo/${v.id}`}
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                Ver Veículo
                                            </Link>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}

            {/* ── Secção de Reviews ─────────────────────────────────────── */}
            <h4 className="mb-3">As Minhas Avaliações</h4>

            {mensagem && (
                <p className={`small ${mensagem.includes('sucesso') ? 'text-success' : 'text-danger'}`}>
                    {mensagem}
                </p>
            )}

            {loadingRev ? (
                <p>A carregar...</p>
            ) : reviews.length === 0 ? (
                <p className="text-muted">Ainda não fizeste nenhuma avaliação.</p>
            ) : (
                <Table responsive hover bordered size="sm">
                    <thead className="table-dark">
                        <tr>
                            <th>Veículo</th>
                            <th>Classificação</th>
                            <th>Comentário</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map(r => (
                            <tr key={r.id}>
                                <td>
                                    <Link to={`/veiculo/${r.veiculo}`}>
                                        Veículo #{r.veiculo}
                                    </Link>
                                </td>
                                <td>{'⭐'.repeat(r.classificacao)}</td>
                                <td>{r.comentario}</td>
                                <td>
                                    <Button
                                        color="danger"
                                        size="sm"
                                        onClick={() => eliminarReview(r.id)}
                                    >
                                        Eliminar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
}
