import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUserContext } from '../../context/UserContext';
import './Header.css';

const URL_LOGOUT = 'http://localhost:8000/api/logout/';

const Header = () => {
    const { user, setUser } = useUserContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        axios.get(URL_LOGOUT, { withCredentials: true })
            .then(() => {
                setUser(null);
                navigate('/');
            })
            .catch(() => console.log('Erro no logout.'));
    };

    return (
        <header className="header">
            <div className="header-container">

                <Link to="/" className="header-logo">
                    <span className="header-logo-text">AutoStand</span>
                </Link>

                <nav className="header-nav">
                    <Link to="/" className="nav-button" title="Home">
                        Home
                    </Link>

                    {user ? (
                        <>
                            <Link to="/profile" className="nav-greeting">
                                Olá, {user.username}!
                            </Link>
                            {user.is_staff && (
                                <Link to="/admin" className="nav-button nav-button-text">
                                    Admin
                                </Link>
                            )}
                            <button onClick={handleLogout} className="nav-button nav-button-primary">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-button nav-button-text">
                                Login
                            </Link>
                            <Link to="/signup" className="nav-button nav-button-primary">
                                Registar
                            </Link>
                        </>
                    )}
                </nav>

            </div>
        </header>
    );
};

export default Header;