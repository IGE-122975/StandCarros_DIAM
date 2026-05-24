import { Link } from 'react-router-dom';
import './VehicleCard.css';

const VehicleCard = ({ veiculo }) => {
    
    const fotoPrincipal = veiculo.fotos && veiculo.fotos.length > 0
        ? `http://localhost:8000${veiculo.fotos[0].foto}`
        : null;

    return (
        <Link to={`/vehicles/${veiculo.id}`} className="vehicle-card">

            <div className="vehicle-card-image">
                {fotoPrincipal ? (
                    <img src={fotoPrincipal} alt={`${veiculo.marca} ${veiculo.modelo}`} />
                ) : (
                    <div className="vehicle-card-no-image">Sem foto</div>
                )}
            </div>

            <div className="vehicle-card-info">
                <h3 className="vehicle-card-title">
                    {veiculo.marca} {veiculo.modelo}
                </h3>
                <p className="vehicle-card-year">{veiculo.ano}</p>
            </div>

        </Link>
    );
};

export default VehicleCard;