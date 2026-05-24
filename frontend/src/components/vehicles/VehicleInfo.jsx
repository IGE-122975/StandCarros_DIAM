import { useState } from 'react';
import './VehicleInfo.css';

const VehicleInfo = ({ veiculo }) => {
    const [descricaoAberta, setDescricaoAberta] = useState(false);

    return (
        <div className="vi">

            <h1 className="vi-title">
                {veiculo.marca} {veiculo.modelo}
            </h1>

            <p className="vi-price">
                {parseFloat(veiculo.preco).toLocaleString('pt-PT')} €
            </p>

            {veiculo.estado === 'vendido' && (
                <span className="vi-sold">Vendido</span>
            )}

            <div className="vi-specs">
                <div className="vi-spec">
                    <span className="vi-spec-label">Ano</span>
                    <span className="vi-spec-value">{veiculo.ano}</span>
                </div>
                <div className="vi-spec">
                    <span className="vi-spec-label">Quilometragem</span>
                    <span className="vi-spec-value">{veiculo.quilometragem.toLocaleString('pt-PT')} km</span>
                </div>
                {veiculo.media_classificacao && (
                    <div className="vi-spec">
                        <span className="vi-spec-label">Classificação</span>
                        <span className="vi-spec-value">{veiculo.media_classificacao} ★ ({veiculo.total_reviews})</span>
                    </div>
                )}
            </div>

            {veiculo.descricao && (
                <div className="vi-description">
                    <button
                        className="vi-description-toggle"
                        onClick={() => setDescricaoAberta(!descricaoAberta)}
                    >
                        Descrição {descricaoAberta ? '▲' : '▼'}
                    </button>
                    {descricaoAberta && (
                        <p className="vi-description-text">{veiculo.descricao}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default VehicleInfo;