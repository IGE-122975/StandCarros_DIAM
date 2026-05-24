import { useState, useEffect } from 'react';
import axios from 'axios';
import VehicleFilters from '../components/vehicles/VehicleFilters';
import VehicleCard from '../components/vehicles/VehicleCard';
import './Home.css';

const URL_VEHICLES = 'http://localhost:8000/api/vehicles/';

const Home = () => {
    const [veiculos, setVeiculos] = useState([]);
    const [filtros, setFiltros] = useState({});
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        axios.get(URL_VEHICLES)
            .then(response => {
                setVeiculos(response.data);
                setCarregando(false);
            })
            .catch(err => {
                console.log('Erro ao obter veículos:', err);
                setCarregando(false);
            });
    }, []);


    const veiculosFiltrados = veiculos.filter(v => {
        if (filtros.marca && !v.marca.toLowerCase().includes(filtros.marca.toLowerCase())) return false;
        if (filtros.modelo && !v.modelo.toLowerCase().includes(filtros.modelo.toLowerCase())) return false;
        if (filtros.ano && v.ano != filtros.ano) return false;
        if (filtros.preco_min && parseFloat(v.preco) < parseFloat(filtros.preco_min)) return false;
        if (filtros.preco_max && parseFloat(v.preco) > parseFloat(filtros.preco_max)) return false;
        if (filtros.estado && v.estado !== filtros.estado) return false;
        return true;
    });

    return (
        <div className="home">
            <div className="home-hero">
                <h1>Encontre o seu próximo carro</h1>
                <p>Explore o nosso catálogo de viaturas disponíveis</p>
            </div>

            <div className="home-filters">
                <VehicleFilters filtros={filtros} setFiltros={setFiltros} />
            </div>

            {carregando ? (
                <p className="home-loading">A carregar veículos...</p>
            ) : veiculosFiltrados.length === 0 ? (
                <p className="home-empty">Não foram encontrados veículos com esses filtros.</p>
            ) : (
                <div className="home-grid">
                    {veiculosFiltrados.map(veiculo => (
                        <VehicleCard key={veiculo.id} veiculo={veiculo} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;