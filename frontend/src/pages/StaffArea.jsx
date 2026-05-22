import { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/pt';
import {
    Container, Row, Col, Button, Badge,
    Form, FormGroup, Label, Input,
    Table, Card, CardBody
} from 'reactstrap';
import { getCSRFToken } from '../utils/csrf';

moment.locale('pt');

const COR_ESTADO = {
    pendente: 'warning',
    confirmado: 'success',
    concluido: 'info',
    rejeitado: 'danger',
    reagendado: 'secondary',
};

const LABEL_ESTADO = {
    pendente: 'Pendente',
    confirmado: 'Confirmado',
    concluido: 'Concluído',
    rejeitado: 'Rejeitado',
    reagendado: 'Reagendado',
};

// Secções da área de staff — funciona como navegação por abas
const SECCOES = ['Veículos', 'Test-Drives', 'Avaliações'];

const VEICULO_VAZIO = {
    marca: '', modelo: '', ano: '', preco: '',
    quilometragem: '', descricao: '', estado: 'disponivel',
};

export default function StaffArea() {
    const [seccao, setSeccao] = useState('Veículos');

    // ── Estado: Veículos ──────────────────────────────────────────────────
    const [veiculos, setVeiculos] = useState([]);
    const [loadingV, setLoadingV] = useState(true);
    const [formV, setFormV] = useState(VEICULO_VAZIO);
    const [editandoId, setEditandoId] = useState(null);
    const [fotoFicheiro, setFotoFicheiro] = useState(null);
    const [mensagemV, setMensagemV] = useState('');

    // ── Estado: Test-Drives ───────────────────────────────────────────────
    const [testDrives, setTestDrives] = useState([]);
    const [loadingTD, setLoadingTD] = useState(true);
    const [novaDataHora, setNovaDataHora] = useState({});
    const [mensagemTD, setMensagemTD] = useState('');

    // ── Estado: Reviews ───────────────────────────────────────────────────
    const [reviews, setReviews] = useState([]);
    const [loadingRev, setLoadingRev] = useState(true);
    const [mensagemRev, setMensagemRev] = useState('');

    // Carrega veículos
    useEffect(() => {
        axios.get('api/vehicles/')
            .then(res => { setVeiculos(res.data); setLoadingV(false); })
            .catch(() => setLoadingV(false));
    }, []);

    // Carrega test-drives (todos, visível para staff)
    useEffect(() => {
        axios.get('api/testdrives/')
            .then(res => { setTestDrives(res.data); setLoadingTD(false); })
            .catch(() => setLoadingTD(false));
    }, []);

    // Carrega reviews (todas)
    useEffect(() => {
        axios.get('api/reviews/')
            .then(res => { setReviews(res.data); setLoadingRev(false); })
            .catch(() => setLoadingRev(false));
    }, []);

    // ── Handlers: Veículos ────────────────────────────────────────────────

    const handleFormVChange = (e) => {
        const { name, value } = e.target;
        setFormV(prev => ({ ...prev, [name]: value }));
    };

    const iniciarEdicao = (v) => {
        setEditandoId(v.id);
        setFormV({
            marca: v.marca, modelo: v.modelo, ano: v.ano,
            preco: v.preco, quilometragem: v.quilometragem,
            descricao: v.descricao || '', estado: v.estado,
        });
        setMensagemV('');
    };

    const cancelarEdicao = () => {
        setEditandoId(null);
        setFormV(VEICULO_VAZIO);
        setFotoFicheiro(null);
        setMensagemV('');
    };

    // Cria ou actualiza um veículo
    const submeterVeiculo = async (e) => {
        e.preventDefault();
        setMensagemV('');

        // A API de veículos aceita apenas campos do Vehicle (não aceita o ficheiro "foto").
        // Se houver foto, é enviada depois via POST /api/vehicles/:id/photos/
        const data = new FormData();
        Object.entries(formV).forEach(([k, v]) => data.append(k, v));

        const headers = { 'X-CSRFToken': getCSRFToken() };

        try {
            let res;
            if (editandoId) {
                // PUT actualiza o veículo existente
                res = await axios.put(`api/vehicles/${editandoId}/`, data, { headers });
                setVeiculos(prev => prev.map(v => v.id === editandoId ? res.data : v));
                setMensagemV('Veículo actualizado com sucesso!');
            } else {
                // POST cria um novo veículo
                res = await axios.post('api/vehicles/', data, { headers });
                setVeiculos(prev => [...prev, res.data]);
                setMensagemV('Veículo criado com sucesso!');
            }

            if (fotoFicheiro) {
                const fotoData = new FormData();
                fotoData.append('foto', fotoFicheiro);
                await axios.post(`api/vehicles/${res.data.id}/photos/`, fotoData, { headers });
            }

            setEditandoId(null);
            setFormV(VEICULO_VAZIO);
            setFotoFicheiro(null);
        } catch (err) {
            setMensagemV(
                err.response?.data?.detail ||
                err.response?.data?.msg ||
                'Erro ao guardar veículo.'
            );
        }
            setMensagemV(err.response?.data?.detail || 'Erro ao guardar veículo.');
        }
    };

    const eliminarVeiculo = async (id) => {
        if (!window.confirm('Tens a certeza que queres eliminar este veículo?')) return;
        try {
            await axios.delete(`api/vehicles/${id}/`, {
                headers: { 'X-CSRFToken': getCSRFToken() },
            });
            setVeiculos(prev => prev.filter(v => v.id !== id));
            setMensagemV('Veículo eliminado.');
        } catch (err) {
            setMensagemV('Erro ao eliminar veículo.');
        }
    };

    // ── Handlers: Test-Drives ─────────────────────────────────────────────

    // Actualiza o estado de um test-drive (confirmar, concluir, rejeitar, etc.)
    const actualizarEstadoTD = async (tdId, novoEstado) => {
        setMensagemTD('');
        const body = { estado: novoEstado };
        // Se está a reagendar, inclui a nova data/hora no body
        if (novoEstado === 'reagendado') {
            if (!novaDataHora[tdId]) {
                setMensagemTD('Indica a nova data/hora para reagendar.');
                return;
            }
            body.data_hora = novaDataHora[tdId];
        }
        try {
            const res = await axios.put(`api/testdrives/${tdId}/`, body, {
                headers: { 'X-CSRFToken': getCSRFToken() },
            });
            setTestDrives(prev => prev.map(td => td.id === tdId ? res.data : td));
            setNovaDataHora(prev => { const n = { ...prev }; delete n[tdId]; return n; });
        } catch (err) {
            setMensagemTD(err.response?.data?.detail || 'Erro ao actualizar test-drive.');
        }
    };

    // ── Handlers: Reviews ─────────────────────────────────────────────────

    const eliminarReview = async (reviewId) => {
        setMensagemRev('');
        try {
            await axios.delete(`api/reviews/${reviewId}/`, {
                headers: { 'X-CSRFToken': getCSRFToken() },
            });
            setReviews(prev => prev.filter(r => r.id !== reviewId));
            setMensagemRev('Avaliação eliminada.');
        } catch (err) {
            setMensagemRev('Erro ao eliminar avaliação.');
        }
    };

    // ── Renderização ──────────────────────────────────────────────────────

    return (
        <Container className="my-4">
            <h2 className="mb-1">Área de Staff</h2>
            <p className="text-muted mb-4 small">Gestão de veículos, test-drives e avaliações.</p>

            {/* Barra de navegação entre secções */}
            <div className="d-flex gap-2 mb-4 border-bottom pb-3">
                {SECCOES.map(s => (
                    <Button
                        key={s}
                        color={seccao === s ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => setSeccao(s)}
                    >
                        {s}
                    </Button>
                ))}
            </div>

            {/* ══ SECÇÃO: VEÍCULOS ══════════════════════════════════════════ */}
            {seccao === 'Veículos' && (
                <div>
                    {/* Formulário de criação / edição */}
                    <Card className="mb-4 shadow-sm border-0 bg-light">
                        <CardBody>
                            <h5 className="fw-bold mb-3">
                                {editandoId ? 'Editar Veículo' : 'Adicionar Veículo'}
                            </h5>
                            <Form onSubmit={submeterVeiculo}>
                                <Row>
                                    <Col md="4">
                                        <FormGroup>
                                            <Label>Marca</Label>
                                            <Input name="marca" value={formV.marca}
                                                onChange={handleFormVChange} required />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4">
                                        <FormGroup>
                                            <Label>Modelo</Label>
                                            <Input name="modelo" value={formV.modelo}
                                                onChange={handleFormVChange} required />
                                        </FormGroup>
                                    </Col>
                                    <Col md="2">
                                        <FormGroup>
                                            <Label>Ano</Label>
                                            <Input type="number" name="ano" value={formV.ano}
                                                onChange={handleFormVChange} required />
                                        </FormGroup>
                                    </Col>
                                    <Col md="2">
                                        <FormGroup>
                                            <Label>Estado</Label>
                                            <Input type="select" name="estado" value={formV.estado}
                                                onChange={handleFormVChange}>
                                                <option value="disponivel">Disponível</option>
                                                <option value="vendido">Vendido</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col md="4">
                                        <FormGroup>
                                            <Label>Preço (€)</Label>
                                            <Input type="number" name="preco" value={formV.preco}
                                                onChange={handleFormVChange} required />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4">
                                        <FormGroup>
                                            <Label>Quilometragem</Label>
                                            <Input type="number" name="quilometragem" value={formV.quilometragem}
                                                onChange={handleFormVChange} required />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4">
                                        <FormGroup>
                                            <Label>Foto</Label>
                                            <Input type="file" accept="image/*"
                                                onChange={e => setFotoFicheiro(e.target.files[0])} />
                                        </FormGroup>
                                    </Col>
                                    <Col xs="12">
                                        <FormGroup>
                                            <Label>Descrição</Label>
                                            <Input type="textarea" name="descricao" rows="2"
                                                value={formV.descricao} onChange={handleFormVChange} />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <div className="d-flex gap-2">
                                    <Button color="success" size="sm" type="submit">
                                        {editandoId ? 'Guardar Alterações' : 'Adicionar Veículo'}
                                    </Button>
                                    {editandoId && (
                                        <Button color="secondary" size="sm" onClick={cancelarEdicao}>
                                            Cancelar
                                        </Button>
                                    )}
                                </div>
                            </Form>
                            {mensagemV && (
                                <p className={`mt-2 small ${mensagemV.includes('sucesso') || mensagemV.includes('criado') || mensagemV.includes('actualizado') ? 'text-success' : 'text-danger'}`}>
                                    {mensagemV}
                                </p>
                            )}
                        </CardBody>
                    </Card>

                    {/* Tabela de veículos existentes */}
                    {loadingV ? <p>A carregar...</p> : (
                        <Table responsive hover bordered size="sm">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Marca / Modelo</th>
                                    <th>Ano</th>
                                    <th>Preço</th>
                                    <th>Estado</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {veiculos.map(v => (
                                    <tr key={v.id}>
                                        <td>{v.id}</td>
                                        <td>{v.marca} {v.modelo}</td>
                                        <td>{v.ano}</td>
                                        <td>{Number(v.preco).toLocaleString('pt-PT')} €</td>
                                        <td>
                                            <Badge color={v.estado === 'disponivel' ? 'success' : 'danger'}>
                                                {v.estado === 'disponivel' ? 'Disponível' : 'Vendido'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <Button color="warning" size="sm"
                                                    onClick={() => iniciarEdicao(v)}>
                                                    Editar
                                                </Button>
                                                <Button color="danger" size="sm"
                                                    onClick={() => eliminarVeiculo(v.id)}>
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            )}

            {/* ══ SECÇÃO: TEST-DRIVES ═══════════════════════════════════════ */}
            {seccao === 'Test-Drives' && (
                <div>
                    <h5 className="mb-3">Todos os Test-Drives</h5>
                    {mensagemTD && (
                        <p className={`small ${mensagemTD.includes('Erro') ? 'text-danger' : 'text-info'}`}>
                            {mensagemTD}
                        </p>
                    )}

                    {loadingTD ? <p>A carregar...</p> : (
                        <Table responsive hover bordered size="sm">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Utilizador</th>
                                    <th>Veículo</th>
                                    <th>Data/Hora</th>
                                    <th>Estado</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {testDrives.map(td => {
                                    const v = td.veiculo_detalhe;
                                    return (
                                        // Fragment com key permite retornar múltiplos <tr> por item
                                        <Fragment key={td.id}>
                                            <tr>
                                                <td>{td.id}</td>
                                                <td>{td.utilizador?.username || '—'}</td>
                                                <td>{v ? `${v.marca} ${v.modelo}` : `#${td.veiculo}`}</td>
                                                <td className="small">
                                                    {moment(td.data_hora).format('D MMM YYYY, HH:mm')}
                                                </td>
                                                <td>
                                                    <Badge color={COR_ESTADO[td.estado] || 'secondary'}>
                                                        {LABEL_ESTADO[td.estado] || td.estado}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {td.estado === 'pendente' && (
                                                            <>
                                                                <Button color="success" size="sm"
                                                                    onClick={() => actualizarEstadoTD(td.id, 'confirmado')}>
                                                                    Confirmar
                                                                </Button>
                                                                <Button color="danger" size="sm"
                                                                    onClick={() => actualizarEstadoTD(td.id, 'rejeitado')}>
                                                                    Rejeitar
                                                                </Button>
                                                            </>
                                                        )}
                                                        {td.estado === 'confirmado' && (
                                                            <Button color="info" size="sm"
                                                                onClick={() => actualizarEstadoTD(td.id, 'concluido')}>
                                                                Concluir
                                                            </Button>
                                                        )}
                                                        {(td.estado === 'pendente' || td.estado === 'confirmado') && (
                                                            <Button color="secondary" size="sm"
                                                                onClick={() => setNovaDataHora(prev => ({
                                                                    ...prev,
                                                                    [td.id]: prev[td.id] !== undefined ? undefined : ''
                                                                }))}>
                                                                Reagendar
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Linha extra para reagendamento — só aparece quando o botão é clicado */}
                                            {novaDataHora[td.id] !== undefined && (
                                                <tr>
                                                    <td colSpan="6" className="bg-light">
                                                        <div className="d-flex align-items-center gap-2 p-1">
                                                            <Input
                                                                type="datetime-local"
                                                                bsSize="sm"
                                                                style={{ maxWidth: '250px' }}
                                                                value={novaDataHora[td.id] || ''}
                                                                onChange={e => setNovaDataHora(prev => ({
                                                                    ...prev, [td.id]: e.target.value
                                                                }))}
                                                            />
                                                            <Button color="secondary" size="sm"
                                                                onClick={() => actualizarEstadoTD(td.id, 'reagendado')}>
                                                                Confirmar Reagendamento
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </div>
            )}

            {/* ══ SECÇÃO: AVALIAÇÕES ════════════════════════════════════════ */}
            {seccao === 'Avaliações' && (
                <div>
                    <h5 className="mb-3">Todas as Avaliações</h5>
                    {mensagemRev && (
                        <p className={`small ${mensagemRev.includes('Erro') ? 'text-danger' : 'text-success'}`}>
                            {mensagemRev}
                        </p>
                    )}

                    {loadingRev ? <p>A carregar...</p> : reviews.length === 0 ? (
                        <p className="text-muted">Não existem avaliações.</p>
                    ) : (
                        <Table responsive hover bordered size="sm">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Utilizador</th>
                                    <th>Veículo</th>
                                    <th>Classificação</th>
                                    <th>Comentário</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.id}</td>
                                        <td>{r.utilizador.username}</td>
                                        <td>#{r.veiculo}</td>
                                        <td>{'⭐'.repeat(r.classificacao)}</td>
                                        <td>{r.comentario}</td>
                                        <td>
                                            <Button color="danger" size="sm"
                                                onClick={() => eliminarReview(r.id)}>
                                                Eliminar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            )}
        </Container>
    );
}
