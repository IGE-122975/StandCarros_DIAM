import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const URL_SIGNUP = 'http://localhost:8000/api/signup/';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    const handleSignup = (e) => {
        e.preventDefault();
        setErro('');

        axios.post(URL_SIGNUP, { username, email, password })
            .then(() => {
                navigate('/login');
            })
            .catch((err) => {
                const msg = err.response?.data?.msg || 'Erro ao registar. Tente novamente.';
                setErro(msg);
            });
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Criar Conta</h2>
                <p className="auth-subtitle">Junte-se ao AutoStand!</p>

                <form onSubmit={handleSignup} className="auth-form">

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
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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

                    <button type="submit" className="auth-submit">Registar</button>
                </form>

                <p className="auth-footer-text">
                    Já tem conta? <Link to="/login">Entrar</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;