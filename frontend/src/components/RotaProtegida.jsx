import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'reactstrap';

// Componente que envolve páginas protegidas.
// Se o utilizador não está autenticado, mostra um aviso em vez da página pedida.
// Se staffOnly=true, também verifica se o utilizador é staff.
export default function RotaProtegida({ children, staffOnly = false }) {
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

    return children;
}
