import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    Container, Row, Col, Card, CardImg, CardBody,
    CardTitle, CardSubtitle, CardText, Badge
} from 'reactstrap';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const fotoBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function Home() {
    const [carros, setCarros] = useState([]);

    useEffect(() => {
        axios.get('api/vehicles/')
            .then(response => setCarros(response.data))
            .catch(error => console.error('Erro ao carregar veículos:', error));
    }, []);

    return (
        <Container style={{ marginTop: '40px', marginBottom: '40px' }}>
            <h2 className="mb-4">Veículos Disponíveis</h2>

            <Row>
                {carros.map((carro) => (
                    <Col xs="12" md="6" lg="4" className="mb-4" key={carro.id}>
                        <Card className="h-100 shadow-sm border-0">
                            {carro.fotos && carro.fotos.length > 0 ? (
                                <CardImg
                                    top
                                    width="100%"
                                    src={carro.fotos[0].foto?.startsWith('http')
                                        ? carro.fotos[0].foto
                                        : `${fotoBase}${carro.fotos[0].foto}`}
                                    alt={`${carro.marca} ${carro.modelo}`}
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
                                    {carro.marca} {carro.modelo}
                                </CardTitle>
                                <CardSubtitle className="mb-3 text-muted" tag="h6">
                                    Ano: {carro.ano} | {carro.quilometragem} km
                                </CardSubtitle>

                                <CardText className="mt-auto mb-0 pt-3 border-top">
                                    <span className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="h5 mb-0 text-primary fw-bold">{carro.preco} €</span>
                                        <Badge color={carro.estado === 'vendido' ? 'danger' : 'success'}>
                                            {carro.estado === 'vendido' ? 'Vendido' : 'Disponível'}
                                        </Badge>
                                    </span>
                                    <Link
                                        to={`/veiculo/${carro.id}`}
                                        className="btn btn-outline-primary btn-sm w-100"
                                    >
                                        Ver Detalhes
                                    </Link>
                                </CardText>
                            </CardBody>
                        </Card>
                    </Col>
                ))}
            </Row>

            {carros.length === 0 && (
                <div className="text-center text-muted mt-5">
                    <p>A carregar veículos...</p>
                </div>
            )}
        </Container>
    );
}

export default Home;
