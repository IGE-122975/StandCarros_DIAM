import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'reactstrap';

// Componente que envolve páginas protegidas.
// - Sem sessão → mostra aviso de login.
// - staffOnly=true → só staff pode aceder.
// - clienteOnly=true → só clientes (não-staff) podem aceder.
export default function RotaProtegida({ children, staffOnly = false, clienteOnly = false }) {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const isStaff = localStorage.getItem('is_staff') === 'true';

    if (!username) {
        return (
            <Container className="mt-5 text-center">
                <h4>Acesso Restrito</h4>
                <p className="text-muted">Precisas de iniciar sessão para aceder a esta página.</p>
                <Button color="primary" onClick={() => navigate('/login')}>Iniciar Sessão</Button>
            </Container>
        );
    }

    if (staffOnly && !isStaff) {
        return (
            <Container className="mt-5 text-center">
                <h4>Sem Permissão</h4>
                <p className="text-muted">Esta página é exclusiva para a equipa de staff.</p>
                <Button color="secondary" onClick={() => navigate('/')}>Voltar ao Início</Button>
            </Container>
        );
    }

    if (clienteOnly && isStaff) {
        return (
            <Container className="mt-5 text-center">
                <h4>Página para Clientes</h4>
                <p className="text-muted">Esta área é destinada a clientes. Como membro do staff, usa a área "Staff".</p>
                <Button color="secondary" onClick={() => navigate('/staff')}>Ir para Staff</Button>
            </Container>
        );
    }

    return children;
}
