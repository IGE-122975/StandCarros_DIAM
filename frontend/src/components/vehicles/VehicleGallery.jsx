import { useState } from 'react';
import './VehicleGallery.css';

const VehicleGallery = ({ fotos }) => {
    const [indice, setIndice] = useState(0);

    if (!fotos || fotos.length === 0) {
        return (
            <div className="gallery-empty">
                <p>Sem fotos disponíveis</p>
            </div>
        );
    }

    const fotoAtual = `http://localhost:8000${fotos[indice].foto}`;

    const anterior = () => {
        setIndice(indice === 0 ? fotos.length - 1 : indice - 1);
    };

    const seguinte = () => {
        setIndice(indice === fotos.length - 1 ? 0 : indice + 1);
    };

    return (
        <div className="gallery">

            <div className="gallery-main">
                <img src={fotoAtual} alt={`Foto ${indice + 1}`} />

                {fotos.length > 1 && (
                    <>
                        <button className="gallery-arrow gallery-arrow-left" onClick={anterior}>
                            ‹
                        </button>
                        <button className="gallery-arrow gallery-arrow-right" onClick={seguinte}>
                            ›
                        </button>
                    </>
                )}

                <div className="gallery-counter">
                    {indice + 1} / {fotos.length}
                </div>
            </div>
            {fotos.length > 1 && (
                <div className="gallery-thumbs">
                    {fotos.map((foto, i) => (
                        <img
                            key={foto.id}
                            src={`http://localhost:8000${foto.foto}`}
                            alt={`Miniatura ${i + 1}`}
                            className={`gallery-thumb ${i === indice ? 'gallery-thumb-active' : ''}`}
                            onClick={() => setIndice(i)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default VehicleGallery;