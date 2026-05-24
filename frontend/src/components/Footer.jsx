import { Container, Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        // mt-auto empurra o footer para o fundo da página
        <footer className="bg-dark text-light py-4 mt-auto">
            <Container>
                <Row>
                    <Col md="6" className="mb-3 mb-md-0">
                        <h5 className="fw-bold">StandCarros</h5>
                        <p className="text-muted small">A sua plataforma de confiança para encontrar o veículo ideal.</p>
                    </Col>
                    <Col md="6" className="text-md-end">
                        <ul className="list-unstyled">
                            {/* Usamos <Link> em vez de <a> para ser instantâneo */}
                            <li><Link to="/" className="text-light text-decoration-none">Início</Link></li>
                            <li><Link to="/sobre" className="text-light text-decoration-none">Sobre Nós</Link></li>
                        </ul>
                    </Col>
                </Row>
                <div className="text-center mt-3 pt-3 border-top border-secondary text-muted small">
                    &copy; {new Date().getFullYear()} StandCarros. Todos os direitos reservados.
                </div>
            </Container>
        </footer>
    );
}