import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUserContext } from '../context/UserContext';
import VehicleGallery from '../components/vehicles/VehicleGallery';
import VehicleInfo from '../components/vehicles/VehicleInfo';
import VehicleActions from '../components/vehicles/VehicleActions.jsx';
import './VehicleDetail.css';
import VehicleReviews from '../components/vehicles/VehicleReviews';


const URL_VEHICLES = 'http://localhost:8000/api/vehicles/';

const VehicleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUserContext();

    const [veiculo, setVeiculo] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        axios.get(`${URL_VEHICLES}${id}/`)
            .then(response => {
                setVeiculo(response.data);
                setCarregando(false);
            })
            .catch(() => {
                setCarregando(false);
            });
    }, [id]);

    if (carregando) return <p className="vd-loading">A carregar...</p>;
    if (!veiculo) return <p className="vd-loading">Veículo não encontrado.</p>;

    return (
        <div className="vd-container">
            <button className="vd-back" onClick={() => navigate('/')}>← Voltar</button>

            <div className="vd-layout">
                <div className="vd-left">
                    <VehicleGallery fotos={veiculo.fotos} />
                </div>
                <div className="vd-right">
                    <VehicleInfo veiculo={veiculo} />
                    <VehicleActions veiculo={veiculo} user={user} />
                    <VehicleReviews veiculoId={veiculo.id} />
                </div>
            </div>
        </div>
    );
};

export default VehicleDetail;