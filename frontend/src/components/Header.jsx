import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarToggler, Collapse, Nav, NavItem, Button } from 'reactstrap';
import axios from 'axios';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('username'));
    const navigate = useNavigate();

    // Este useEffect "escuta" sempre que o login ou logout acontece para atualizar o cabeçalho
    useEffect(() => {
        const checkLogin = () => setLoggedInUser(localStorage.getItem('username'));
        window.addEventListener("storage", checkLogin);
        return () => window.removeEventListener("storage", checkLogin);
    }, []);

    const handleLogout = async () => {
        try {
            await axios.get('api/logout/');
            localStorage.removeItem('username'); // Apaga o nome do browser
            setLoggedInUser(null);

            navigate('/'); // Redireciona para o início
        } catch (error) {
            console.error("Erro ao fazer logout", error);
        }
    };

    return (
        <Navbar color="dark" dark expand="md" className="shadow-sm">
            <div className="container">
                <NavbarBrand tag={Link} to="/" className="fw-bold">StandCarros</NavbarBrand>
                <NavbarToggler onClick={toggle} />
                <Collapse isOpen={isOpen} navbar>
                    <Nav className="me-auto" navbar>
                        <NavItem><Link className="nav-link" to="/">Início</Link></NavItem>
                        <NavItem><Link className="nav-link" to="/sobre">Sobre Nós</Link></NavItem>
                    </Nav>

                    {!loggedInUser ? (
                        <div className="d-flex">
                            <Link to="/login" className="btn btn-outline-light btn-sm me-2">Entrar</Link>
                            <Link to="/registo" className="btn btn-primary btn-sm">Registar</Link>
                        </div>
                    ) : (
                        <div className="d-flex align-items-center">
                            <span className="text-light me-3 small">Olá, {loggedInUser}</span>
                            <a href="http://127.0.0.1:8000/admin/" className="btn btn-outline-info btn-sm me-2">
                                Admin
                            </a>
                            <Button color="danger" size="sm" onClick={handleLogout}>Sair</Button>
                        </div>
                    )}
                </Collapse>
            </div>
        </Navbar>
    );
}