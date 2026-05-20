import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button } from 'reactstrap';

export default function Registo() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRegisto = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('api/signup/', formData);
            alert(response.data.msg);
            navigate('/login');
        } catch (error) {
            console.error("Erro completo:", error.response); // Mostra o erro na consola (F12)

            // Tenta ir buscar a mensagem exata do Django (detail para segurança, msg para validação)
            const mensagemErro = error.response?.data?.detail
                              || error.response?.data?.msg
                              || "Erro de comunicação com o servidor.";

            alert("Falha no registo: " + mensagemErro);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md="8" lg="6">
                    <Card className="shadow-sm border-0 mt-4">
                        <CardBody className="p-4">
                            <h3 className="text-center mb-4 fw-bold">Criar Conta</h3>
                            <Form onSubmit={handleRegisto}>
                                <Row>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="first_name">Nome</Label>
                                            <Input id="first_name" type="text" onChange={handleChange} required />
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="last_name">Apelido</Label>
                                            <Input id="last_name" type="text" onChange={handleChange} required />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <FormGroup>
                                    <Label for="email">E-mail</Label>
                                    <Input id="email" type="email" onChange={handleChange} required />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="username">Username</Label>
                                    <Input id="username" type="text" onChange={handleChange} required />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="password">Password</Label>
                                    <Input id="password" type="password" onChange={handleChange} required />
                                </FormGroup>
                                <Button color="success" block className="w-100 mt-3">
                                    Registar
                                </Button>
                            </Form>
                            <div className="text-center mt-3 small">
                                Já tens conta? <Link to="/login">Inicia sessão aqui</Link>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}