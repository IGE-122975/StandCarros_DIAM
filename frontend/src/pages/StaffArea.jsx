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
import { COR_ESTADO_VEICULO, LABEL_ESTADO_VEICULO } from '../utils/estados';

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
const SECCOES = ['Veículos', 'Test-Drives', 'Avaliações', 'Leads'];

const COR_LEAD = {
    novo: 'primary',
    contactado: 'info',
    fechado: 'secondary',
};

const LABEL_LEAD = {
    novo: 'Novo',
    contactado: 'Contactado',
    fechado: 'Fechado',
};

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

    // ── Estado: Leads ─────────────────────────────────────────────────────
    const [leads, setLeads] = useState([]);
    const [loadingLeads, setLoadingLeads] = useState(true);
    const [mensagemLead, setMensagemLead] = useState('');

    // Funções de recarregamento — usadas no mount e ao trocar de aba
    const recarregarVeiculos = () => {
        setLoadingV(true);
        axios.get('/api/vehicles/')
            .then(res => { setVeiculos(res.data); setLoadingV(false); })
            .catch(() => setLoadingV(false));
    };

    const recarregarTD = () => {
        setLoadingTD(true);
        axios.get('/api/testdrives/')
            .then(res => { setTestDrives(res.data); setLoadingTD(false); })
            .catch(() => setLoadingTD(false));
    };

    const recarregarReviews = () => {
        setLoadingRev(true);
        axios.get('/api/reviews/')
            .then(res => { setReviews(res.data); setLoadingRev(false); })
            .catch(() => setLoadingRev(false));
    };

    const recarregarLeads = () => {
        setLoadingLeads(true);
        axios.get('/api/leads/')
            .then(res => { setLeads(res.data); setLoadingLeads(false); })
            .catch(() => setLoadingLeads(false));
    };

    // Recarrega os dados da aba activa sempre que:
    //   1. O utilizador troca de aba dentro da página
    //   2. O tab do browser volta a ganhar foco (visibilitychange)
    // Isto garante que o staff vê dados frescos (ex.: novo lead submetido entretanto).
    useEffect(() => {
        const recarregarSeccao = () => {
            if (seccao === 'Veículos') recarregarVeiculos();
            else if (seccao === 'Test-Drives') recarregarTD();
            else if (seccao === 'Avaliações') recarregarReviews();
            else if (seccao === 'Leads') recarregarLeads();
        };

        recarregarSeccao();

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') recarregarSeccao();
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [seccao]);

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
                res = await axios.put(`/api/vehicles/${editandoId}/`, data, { headers });
                setVeiculos(prev => prev.map(v => v.id === editandoId ? res.data : v));
                setMensagemV('Veículo actualizado com sucesso!');
            } else {
                // POST cria um novo veículo
                res = await axios.post('/api/vehicles/', data, { headers });
                setVeiculos(prev => [...prev, res.data]);
                setMensagemV('Veículo criado com sucesso!');
            }

            if (fotoFicheiro) {
                const fotoData = new FormData();
                fotoData.append('foto', fotoFicheiro);
                await axios.post(`/api/vehicles/${res.data.id}/photos/`, fotoData, { headers });
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
    };

    const eliminarVeiculo = async (id) => {
        if (!window.confirm('Tens a certeza que queres eliminar este veículo?')) return;
        try {
            await axios.delete(`/api/vehicles/${id}/`, {
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
            const res = await axios.put(`/api/testdrives/${tdId}/`, body, {
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
            await axios.delete(`/api/reviews/${reviewId}/`, {
                headers: { 'X-CSRFToken': getCSRFToken() },
            });
            setReviews(prev => prev.filter(r => r.id !== reviewId));
            setMensagemRev('Avaliação eliminada.');
        } catch (err) {
            setMensagemRev('Erro ao eliminar avaliação.');
        }
    };

    // ── Handlers: Leads ───────────────────────────────────────────────────

    const actualizarEstadoLead = async (leadId, novoEstado) => {
        setMensagemLead('');
        try {
            const res = await axios.put(`/api/leads/${leadId}/`,
                { estado: novoEstado },
                { headers: { 'X-CSRFToken': getCSRFToken() } }
            );
            setLeads(prev => prev.map(l => l.id === leadId ? res.data : l));
            setMensagemLead(`✓ Pedido marcado como "${LABEL_LEAD[novoEstado] || novoEstado}".`);
        } catch (err) {
            setMensagemLead('Erro ao actualizar pedido.');
        }
    };

    const eliminarLead = async (leadId) => {
        if (!window.confirm('Tens a certeza que queres eliminar este pedido?')) return;
        setMensagemLead('');
        try {
            await axios.delete(`/api/leads/${leadId}/`, {
                headers: { 'X-CSRFToken': getCSRFToken() },
            });
            setLeads(prev => prev.filter(l => l.id !== leadId));
            setMensagemLead('Pedido eliminado.');
        } catch (err) {
            setMensagemLead('Erro ao eliminar pedido.');
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
                                                <option value="reservado">Reservado</option>
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
                                            <Badge color={COR_ESTADO_VEICULO[v.estado] || 'secondary'}>
                                                {LABEL_ESTADO_VEICULO[v.estado] || v.estado}
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

            {/* ══ SECÇÃO: LEADS ═════════════════════════════════════════════ */}
            {seccao === 'Leads' && (
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Pedidos de Informação</h5>
                        <Button color="secondary" outline size="sm" onClick={recarregarLeads}>
                            🔄 Atualizar
                        </Button>
                    </div>
                    {mensagemLead && (
                        <p className={`small ${mensagemLead.includes('Erro') ? 'text-danger' : 'text-success'}`}>
                            {mensagemLead}
                        </p>
                    )}

                    {loadingLeads ? <p>A carregar...</p> : leads.length === 0 ? (
                        <p className="text-muted">Não existem pedidos de informação.</p>
                    ) : (
                        <Table responsive hover bordered size="sm">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Data</th>
                                    <th>Nome</th>
                                    <th>Contacto</th>
                                    <th>Veículo</th>
                                    <th>Mensagem</th>
                                    <th>Estado</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map(l => {
                                    const v = l.veiculo_detalhe;
                                    return (
                                        <tr key={l.id}>
                                            <td>{l.id}</td>
                                            <td className="small">
                                                {moment(l.criado_em).format('D MMM YYYY, HH:mm')}
                                            </td>
                                            <td>
                                                <strong>{l.nome}</strong>
                                                {l.utilizador && (
                                                    <div className="text-muted small">
                                                        ({l.utilizador.username})
                                                    </div>
                                                )}
                                            </td>
                                            <td className="small">
                                                <div>{l.email}</div>
                                                {l.telefone && <div className="text-muted">{l.telefone}</div>}
                                            </td>
                                            <td>{v ? `${v.marca} ${v.modelo}` : `#${l.veiculo}`}</td>
                                            <td style={{ maxWidth: '250px', whiteSpace: 'pre-wrap' }}>
                                                {l.mensagem}
                                            </td>
                                            <td>
                                                <Badge color={COR_LEAD[l.estado] || 'secondary'}>
                                                    {LABEL_LEAD[l.estado] || l.estado}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {l.estado === 'novo' && (
                                                        <Button color="info" size="sm"
                                                            onClick={() => actualizarEstadoLead(l.id, 'contactado')}>
                                                            Marcar Contactado
                                                        </Button>
                                                    )}
                                                    {l.estado === 'contactado' && (
                                                        <Button color="secondary" size="sm"
                                                            onClick={() => actualizarEstadoLead(l.id, 'fechado')}>
                                                            Fechar
                                                        </Button>
                                                    )}
                                                    <Button color="danger" size="sm"
                                                        onClick={() => eliminarLead(l.id)}>
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </div>
            )}
        </Container>
    );
}
