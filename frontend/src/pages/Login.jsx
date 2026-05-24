import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useUserContext } from '../context/UserContext';
import './Login.css';

const URL_LOGIN = 'http://localhost:8000/api/login/';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [erro, setErro] = useState('');
    const navigate = useNavigate();
    const { setUser } = useUserContext();

    const handleLogin = (e) => {
        e.preventDefault();
        setErro('');

        axios.post(URL_LOGIN, { username, password }, { withCredentials: true })
            .then((response) => {
                setUser({
                    username: response.data.username,
                    is_staff: response.data.is_staff
                });
                navigate('/');
            })
            .catch(() => {
                setErro('Credenciais inválidas. Tente novamente.');
            });
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Entrar</h2>
                <p className="auth-subtitle">Bem-vindo de volta!</p>

                <form onSubmit={handleLogin} className="auth-form">

                    <div className="auth-field">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {erro && <p className="auth-error">{erro}</p>}

                    <button type="submit" className="auth-submit">Entrar</button>
                </form>

                <p className="auth-footer-text">
                    Ainda não tem conta? <Link to="/signup">Registar</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;