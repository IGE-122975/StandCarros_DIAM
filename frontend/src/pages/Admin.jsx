import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import AdminVehicles from '../components/admin/AdminVehicles';
import AdminTestDrives from '../components/admin/AdminTestDrives';
import AdminPurchases from '../components/admin/AdminPurchases';
import AdminReviews from '../components/admin/AdminReviews';
import './Admin.css';

const Admin = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const [tab, setTab] = useState('vehicles');

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (!user.is_staff) {
            navigate('/');
        }
    }, [user, navigate]);

    if (!user || !user.is_staff) return null;

    return (
        <div className="admin">

            <header className="admin-header">
                <h1>Painel de Administração</h1>
                <p>Bem-vindo, {user.username}.</p>
            </header>

            <nav className="admin-tabs">
                <button
                    className={`admin-tab ${tab === 'vehicles' ? 'admin-tab-active' : ''}`}
                    onClick={() => setTab('vehicles')}
                >
                    Veículos
                </button>
                <button
                    className={`admin-tab ${tab === 'testdrives' ? 'admin-tab-active' : ''}`}
                    onClick={() => setTab('testdrives')}
                >
                    Test-Drives
                </button>
                <button
                    className={`admin-tab ${tab === 'purchases' ? 'admin-tab-active' : ''}`}
                    onClick={() => setTab('purchases')}
                >
                    Vendas
                </button>
                <button
                    className={`admin-tab ${tab === 'reviews' ? 'admin-tab-active' : ''}`}
                    onClick={() => setTab('reviews')}
                >
                    Avaliações
                </button>
            </nav>

            <div className="admin-content">
                {tab === 'vehicles' && <AdminVehicles />}
                {tab === 'testdrives' && <AdminTestDrives />}
                {tab === 'purchases' && <AdminPurchases />}
                {tab === 'reviews' && <AdminReviews />}
            </div>
        </div>
    );
};

export default Admin;