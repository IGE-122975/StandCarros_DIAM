import { useState, useEffect } from 'react';
import axios from 'axios';

const URL_VEHICLES = 'http://localhost:8000/api/vehicles/';

const AdminVehicles = () => {
    const [veiculos, setVeiculos] = useState([]);
    const [modal, setModal] = useState(false);
    const [editandoId, setEditandoId] = useState(null);

    const [marca, setMarca] = useState('');
    const [modelo, setModelo] = useState('');
    const [ano, setAno] = useState('');
    const [preco, setPreco] = useState('');
    const [quilometragem, setQuilometragem] = useState('');
    const [descricao, setDescricao] = useState('');
    const [estado, setEstado] = useState('disponivel');

    const [fotoFile, setFotoFile] = useState(null);
    const [fotosVeiculo, setFotosVeiculo] = useState([]);

    const carregar = () => {
        axios.get(URL_VEHICLES)
            .then(response => setVeiculos(response.data));
    };

    useEffect(() => {
        carregar();
    }, []);

    const abrirNovo = () => {
        setEditandoId(null);
        setMarca('');
        setModelo('');
        setAno('');
        setPreco('');
        setQuilometragem('');
        setDescricao('');
        setEstado('disponivel');
        setFotosVeiculo([]);
        setFotoFile(null);
        setModal(true);
    };

    const abrirEditar = (v) => {
        setEditandoId(v.id);
        setMarca(v.marca);
        setModelo(v.modelo);
        setAno(v.ano);
        setPreco(v.preco);
        setQuilometragem(v.quilometragem);
        setDescricao(v.descricao);
        setEstado(v.estado);
        setFotosVeiculo(v.fotos || []);
        setFotoFile(null);
        setModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dados = { marca, modelo, ano, preco, quilometragem, descricao, estado };

        if (editandoId) {
            axios.put(`${URL_VEHICLES}${editandoId}/`, dados, { withCredentials: true })
                .then(() => {
                    setModal(false);
                    carregar();
                });
        } else {
            axios.post(URL_VEHICLES, dados, { withCredentials: true })
                .then(() => {
                    setModal(false);
                    carregar();
                });
        }
    };

    const handleUploadFoto = () => {
        if (!fotoFile) {
            alert('Selecione uma foto primeiro.');
            return;
        }

        const formData = new FormData();
        formData.append('foto', fotoFile);

        axios.post(`${URL_VEHICLES}${editandoId}/photos/`, formData, {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(() => {
                setFotoFile(null);
                axios.get(`${URL_VEHICLES}${editandoId}/`)
                    .then(response => setFotosVeiculo(response.data.fotos || []));
                carregar();
            })
            .catch(() => alert('Erro ao enviar foto.'));
    };

    const apagar = (id) => {
        if (!window.confirm('Tem a certeza que quer apagar este veículo?')) return;
        axios.delete(`${URL_VEHICLES}${id}/`, { withCredentials: true })
            .then(() => carregar());
    };

    return (
        <div>
            <div className="admin-section-header">
                <h2>Veículos ({veiculos.length})</h2>
                <button className="admin-btn admin-btn-primary" onClick={abrirNovo}>
                    + Adicionar Veículo
                </button>
            </div>

            {veiculos.length === 0 ? (
                <p className="admin-empty">Não há veículos.</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Marca</th>
                            <th>Modelo</th>
                            <th>Ano</th>
                            <th>Preço</th>
                            <th>Estado</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {veiculos.map(v => (
                            <tr key={v.id}>
                                <td>{v.marca}</td>
                                <td>{v.modelo}</td>
                                <td>{v.ano}</td>
                                <td>{parseFloat(v.preco).toLocaleString('pt-PT')} €</td>
                                <td>{v.estado}</td>
                                <td>
                                    <div className="admin-actions">
                                        <button className="admin-btn admin-btn-secondary" onClick={() => abrirEditar(v)}>
                                            Editar
                                        </button>
                                        <button className="admin-btn admin-btn-danger" onClick={() => apagar(v.id)}>
                                            Apagar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {modal && (
                <div className="admin-modal-overlay" onClick={() => setModal(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>{editandoId ? 'Editar Veículo' : 'Novo Veículo'}</h3>
                        <form onSubmit={handleSubmit} className="admin-modal-form">
                            <div className="admin-modal-field">
                                <label>Marca</label>
                                <input type="text" value={marca} onChange={e => setMarca(e.target.value)} required />
                            </div>
                            <div className="admin-modal-field">
                                <label>Modelo</label>
                                <input type="text" value={modelo} onChange={e => setModelo(e.target.value)} required />
                            </div>
                            <div className="admin-modal-field">
                                <label>Ano</label>
                                <input type="number" min="1900" value={ano} onChange={e => setAno(e.target.value)} required />
                            </div>
                            <div className="admin-modal-field">
                                <label>Preço (€)</label>
                                <input type="number" min="0" step="0.01" value={preco} onChange={e => setPreco(e.target.value)} required />
                            </div>
                            <div className="admin-modal-field">
                                <label>Quilometragem</label>
                                <input type="number" min="0" value={quilometragem} onChange={e => setQuilometragem(e.target.value)} required />
                            </div>
                            <div className="admin-modal-field">
                                <label>Descrição</label>
                                <textarea rows="3" value={descricao} onChange={e => setDescricao(e.target.value)} />
                            </div>
                            <div className="admin-modal-field">
                                <label>Estado</label>
                                <select value={estado} onChange={e => setEstado(e.target.value)}>
                                    <option value="disponivel">Disponível</option>
                                    <option value="vendido">Vendido</option>
                                </select>
                            </div>
                            <div className="admin-modal-actions">
                                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="admin-btn admin-btn-primary">
                                    {editandoId ? 'Guardar' : 'Criar'}
                                </button>
                            </div>
                        </form>

                        {editandoId && (
                            <div className="admin-photos-section">
                                <h4>Fotos do Veículo</h4>

                                {fotosVeiculo.length > 0 && (
                                    <div className="admin-photos-grid">
                                        {fotosVeiculo.map(f => (
                                            <img
                                                key={f.id}
                                                src={`http://localhost:8000${f.foto}`}
                                                alt="Foto do veículo"
                                                className="admin-photo-thumb"
                                            />
                                        ))}
                                    </div>
                                )}

                                <div className="admin-photo-upload">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFotoFile(e.target.files[0])}
                                    />
                                    <button type="button" className="admin-btn admin-btn-primary" onClick={handleUploadFoto}>
                                        Enviar Foto
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVehicles;