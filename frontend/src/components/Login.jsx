import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button } from 'reactstrap';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('api/login/', { username, password });

            localStorage.setItem('username', response.data.username);
            localStorage.setItem('is_staff', response.data.is_staff);

            alert(response.data.msg);
            navigate('/');

            // Força o recarregamento do Header para mostrar o estado logado
            window.dispatchEvent(new Event("storage"));
        } catch (error) {
            console.error("Erro completo:", error.response); // Ajuda-te a ver o erro no F12

            // Vai buscar o erro exato do Django (detail para segurança, msg para credenciais inválidas)
            const mensagemErro = error.response?.data?.detail
                              || error.response?.data?.msg
                              || "Verifica as tuas credenciais ou a ligação ao servidor.";

            alert("Erro ao fazer login: " + mensagemErro);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md="6" lg="4">
                    <Card className="shadow-sm border-0 mt-5">
                        <CardBody className="p-4">
                            <h3 className="text-center mb-4 fw-bold">Iniciar Sessão</h3>
                            <Form onSubmit={handleLogin}>
                                <FormGroup>
                                    <Label for="username">Username</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </FormGroup>
                                <Button color="primary" block className="w-100 mt-3">
                                    Entrar
                                </Button>
                            </Form>
                            <div className="text-center mt-3 small">
                                Não tens conta? <Link to="/registo">Regista-te aqui</Link>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}