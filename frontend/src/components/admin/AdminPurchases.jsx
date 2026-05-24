import { useState, useEffect } from 'react';
import axios from 'axios';

const URL_PURCHASES = 'http://localhost:8000/api/purchases/';

const AdminPurchases = () => {
    const [purchases, setPurchases] = useState([]);

    useEffect(() => {
        axios.get(URL_PURCHASES, { withCredentials: true })
            .then(response => setPurchases(response.data));
    }, []);

    const formatarData = (data) => {
        return new Date(data).toLocaleString('pt-PT', {
            day: '2-digit', month: '2-digit', year: 'numeric',
        });
    };

    return (
        <div>
            <div className="admin-section-header">
                <h2>Vendas ({purchases.length})</h2>
            </div>

            {purchases.length === 0 ? (
                <p className="admin-empty">Não há vendas registadas.</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Veículo</th>
                            <th>Preço</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases.map(p => (
                            <tr key={p.id}>
                                <td>{p.utilizador.username}</td>
                                <td>{p.veiculo_detalhe.marca} {p.veiculo_detalhe.modelo}</td>
                                <td>{parseFloat(p.veiculo_detalhe.preco).toLocaleString('pt-PT')} €</td>
                                <td>{formatarData(p.data_compra)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminPurchases;