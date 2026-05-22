import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Row, Col, Card, CardImg, CardBody,
    CardTitle, CardSubtitle, CardText, Button, Badge
} from 'reactstrap';
import { getCSRFToken } from '../utils/csrf';

const fotoBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function Favorites() {
    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Carrega a lista de favoritos do utilizador autenticado
    useEffect(() => {
        axios.get('api/favorites/')
            .then(res => {
                setFavoritos(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Remove um favorito: chama DELETE e actualiza o estado local sem recarregar a página
    const remover = async (favId) => {
        try {
            await axios.delete(`api/favorites/${favId}/`, {
                headers: { 'X-CSRFToken': getCSRFToken() },
            });
            // Filtra o favorito removido da lista, actualizando o estado
            setFavoritos(prev => prev.filter(f => f.id !== favId));
        } catch (err) {
            console.error('Erro ao remover favorito:', err);
        }
    };

    if (loading) return <Container className="mt-5"><p>A carregar...</p></Container>;

    return (
        <Container className="my-4">
            <h2 className="mb-4">Os Meus Favoritos</h2>

            {favoritos.length === 0 ? (
                <p className="text-muted">Ainda não tens nenhum veículo nos favoritos.</p>
            ) : (
                <Row>
                    {favoritos.map(fav => {
                        const v = fav.veiculo_detalhe;
                        const fotoUrl = v.fotos?.length > 0
                            ? (v.fotos[0].foto?.startsWith('http')
                                ? v.fotos[0].foto
                                : `${fotoBase}${v.fotos[0].foto}`)
                            : null;

                        return (
                            <Col xs="12" md="6" lg="4" className="mb-4" key={fav.id}>
                                <Card className="h-100 shadow-sm border-0">
                                    {fotoUrl ? (
                                        <CardImg
                                            top
                                            src={fotoUrl}
                                            alt={`${v.marca} ${v.modelo}`}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="bg-light d-flex justify-content-center align-items-center"
                                            style={{ height: '200px' }}>
                                            <span className="text-muted">Sem imagem</span>
                                        </div>
                                    )}

                                    <CardBody className="d-flex flex-column">
                                        <CardTitle tag="h5" className="fw-bold text-dark mb-1">
                                            {v.marca} {v.modelo}
                                        </CardTitle>
                                        <CardSubtitle className="mb-3 text-muted" tag="h6">
                                            Ano: {v.ano} | {Number(v.quilometragem).toLocaleString('pt-PT')} km
                                        </CardSubtitle>

                                        <CardText className="mt-auto mb-0 pt-3 border-top">
                                            <span className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="h5 mb-0 text-primary fw-bold">{v.preco} €</span>
                                                <Badge color={v.estado === 'vendido' ? 'danger' : 'success'}>
                                                    {v.estado === 'vendido' ? 'Vendido' : 'Disponível'}
                                                </Badge>
                                            </span>
                                            <div className="d-flex gap-2">
                                                <Link
                                                    to={`/veiculo/${v.id}`}
                                                    className="btn btn-outline-primary btn-sm flex-grow-1"
                                                >
                                                    Ver Detalhes
                                                </Link>
                                                <Button
                                                    color="outline-danger"
                                                    size="sm"
                                                    onClick={() => remover(fav.id)}
                                                >
                                                    Remover
                                                </Button>
                                            </div>
                                        </CardText>
                                    </CardBody>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </Container>
    );
}
