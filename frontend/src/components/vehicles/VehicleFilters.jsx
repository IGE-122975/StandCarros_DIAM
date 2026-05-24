import { useState } from 'react';
import './VehicleFilters.css';

const VehicleFilters = ({ filtros, setFiltros }) => {
    const [aberto, setAberto] = useState(false);

    const atualizarFiltro = (chave, valor) => {
        setFiltros({ ...filtros, [chave]: valor });
    };

    const limparFiltros = () => {
        setFiltros({});
    };

    return (
        <div className={`filters ${aberto ? 'filters-open' : ''}`}>

            <button
                className="filters-toggle"
                onClick={() => setAberto(!aberto)}
            >
                 Filtros {aberto ? '▲' : '▼'}
            </button>

            {aberto && (
                <div className="filters-panel">

                    <div className="filters-field">
                        <label>Marca</label>
                        <input
                            type="text"
                            placeholder="Ex: BMW"
                            value={filtros.marca || ''}
                            onChange={(e) => atualizarFiltro('marca', e.target.value)}
                        />
                    </div>

                    <div className="filters-field">
                        <label>Modelo</label>
                        <input
                            type="text"
                            placeholder="Ex: M3"
                            value={filtros.modelo || ''}
                            onChange={(e) => atualizarFiltro('modelo', e.target.value)}
                        />
                    </div>

                    <div className="filters-field">
                        <label>Ano</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="Ex: 2022"
                            value={filtros.ano || ''}
                            onChange={(e) => atualizarFiltro('ano', e.target.value)}
                        />
                    </div>

                    <div className="filters-field">
                        <label>Preço mínimo (€)</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={filtros.preco_min || ''}
                            onChange={(e) => atualizarFiltro('preco_min', e.target.value)}
                        />
                    </div>

                    <div className="filters-field">
                        <label>Preço máximo (€)</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="100000"
                            value={filtros.preco_max || ''}
                            onChange={(e) => atualizarFiltro('preco_max', e.target.value)}
                        />
                    </div>

                    <div className="filters-field">
                        <label>Estado</label>
                        <select
                            value={filtros.estado || ''}
                            onChange={(e) => atualizarFiltro('estado', e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="disponivel">Disponível</option>
                            <option value="vendido">Vendido</option>
                        </select>
                    </div>

                    <button className="filters-clear" onClick={limparFiltros}>
                        Limpar filtros
                    </button>

                </div>
            )}
        </div>
    );
};

export default VehicleFilters;