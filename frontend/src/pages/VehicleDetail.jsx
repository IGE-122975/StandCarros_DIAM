import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Row, Col, Badge, Button,
    Form, FormGroup, Label, Input,
    Card, CardBody, Table
} from 'reactstrap';
import { getCSRFToken } from '../utils/csrf';
import { COR_ESTADO_VEICULO, LABEL_ESTADO_VEICULO } from '../utils/estados';

// Com o proxy do Vite, /media/* é servido pela mesma origem.
const fotoBase = '';

export default function VehicleDetail() {
    // useParams lê o segmento dinâmico ":id" da URL — ex: /veiculo/3 → id = "3"
    const { id } = useParams();
    const navigate = useNavigate();

    // Estado do veículo
    const [veiculo, setVeiculo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    // Galeria de fotos — índice da foto actualmente visível
    const [fotoIdx, setFotoIdx] = useState(0);

    // Favorito — guarda o objecto inteiro (necessário para saber o ID ao remover)
    const [favorito, setFavorito] = useState(null);
    const [favLoading, setFavLoading] = useState(false);
    const [favMensagem, setFavMensagem] = useState('');

    // Formulário de test-drive
    const [mostrarTD, setMostrarTD] = useState(false);
    const [dataHora, setDataHora] = useState('');
    const [tdMensagem, setTdMensagem] = useState('');

    // Pedido de informação (Lead)
    const [mostrarLead, setMostrarLead] = useState(false);
    const [leadForm, setLeadForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
    const [leadMensagem, setLeadMensagem] = useState('');

    // Reviews
    const [reviews, setReviews] = useState([]);
    const [temTDConcluido, setTemTDConcluido] = useState(false);
    const [minhaReview, setMinhaReview] = useState(null);
    const [novaClassif, setNovaClassif] = useState(5);
    const [novoComent, setNovoComent] = useState('');
    const [reviewMensagem, setReviewMensagem] = useState('');

    const username = localStorage.getItem('username');
    const isLoggedIn = !!username;

    // ── Carregar o veículo ───────────────────────────────────────────────────
    // useEffect com [id] corre quando o componente monta e sempre que "id" muda.
    useEffect(() => {
        setLoading(true);
        axios.get(`/api/vehicles/${id}/`)
            .then(res => {
                // Defensive: garantir que o objecto tem a estrutura esperada
                if (!res.data || typeof res.data !== 'object' || !res.data.id) {
                    setErro('Resposta inesperada do servidor. Verifica se o backend Django está a correr.');
                    setLoading(false);
                    return;
                }
                // Garantir que fotos é sempre um array para evitar crashes
                setVeiculo({ ...res.data, fotos: res.data.fotos || [] });
                setLoading(false);
            })
            .catch(() => {
                setErro('Veículo não encontrado.');
                setLoading(false);
            });
    }, [id]);

    // ── Carregar reviews (público) ───────────────────────────────────────────
    useEffect(() => {
        axios.get(`/api/reviews/?veiculo=${id}`)
            .then(res => {
                setReviews(res.data);
                const minha = res.data.find(r => r.utilizador.username === username);
                setMinhaReview(minha || null);
            })
            .catch(() => {});
    }, [id, username]);

    // ── Carregar favoritos e test-drives (só se autenticado) ────────────────
    useEffect(() => {
        if (!isLoggedIn) return;

        axios.get('/api/favorites/')
            .then(res => {
                const fav = res.data.find(f => f.veiculo_detalhe?.id === parseInt(id));
                setFavorito(fav || null);
            })
            .catch(() => {});

        axios.get('/api/testdrives/')
            .then(res => {
                const concluido = res.data.some(
                    td => td.veiculo_detalhe?.id === parseInt(id) && td.estado === 'concluido'
                );
                setTemTDConcluido(concluido);
            })
            .catch(() => {});
    }, [id, isLoggedIn]);

    // ── Navegar na galeria ───────────────────────────────────────────────────
    // O truque "(idx + delta + length) % length" garante que o índice é circular
    // (ao passar do último volta ao primeiro, e vice-versa) — padrão dos apontamentos.
    const mudarFoto = (delta) => {
        const total = veiculo?.fotos?.length || 0;
        if (total === 0) return;
        setFotoIdx(prev => (prev + delta + total) % total);
    };

    // ── Toggle favorito ──────────────────────────────────────────────────────
    const toggleFavorito = async () => {
        setFavLoading(true);
        setFavMensagem('');
        try {
            if (favorito) {
                // DELETE — remove o registo de favorito pelo seu ID
                await axios.delete(`/api/favorites/${favorito.id}/`, {
                    headers: { 'X-CSRFToken': getCSRFToken() },
                });
                setFavorito(null);
                setFavMensagem('Removido dos favoritos.');
            } else {
                // POST — cria um novo favorito para este veículo
                const res = await axios.post(
                    '/api/favorites/',
                    { veiculo: parseInt(id) },
                    { headers: { 'X-CSRFToken': getCSRFToken() } }
                );
                setFavorito(res.data);
                setFavMensagem('Adicionado aos favoritos!');
            }
        } catch (err) {
            console.error('Erro ao actualizar favorito:', err);
            if (err.response?.status === 403) {
                setFavMensagem('Sessão expirada. Faz login novamente.');
            } else {
                setFavMensagem(
                    err.response?.data?.detail ||
                    err.response?.data?.msg ||
                    'Erro ao actualizar favorito.'
                );
            }
        }
        setFavLoading(false);
    };

    // ── Submeter pedido de test-drive ────────────────────────────────────────
    const submeterTestDrive = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                '/api/testdrives/',
                { veiculo: parseInt(id), data_hora: dataHora },
                { headers: { 'X-CSRFToken': getCSRFToken() } }
            );
            setTdMensagem('Test-drive agendado com sucesso! Aguarda confirmação do stand.');
            setMostrarTD(false);
            setDataHora('');
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                setTdMensagem('Sessão inválida. Por favor faz login novamente.');
            } else {
                // Erros de validação podem vir em formatos diferentes (dict, list, string)
                const data = err.response?.data;
                let mensagem = 'Erro ao agendar test-drive.';
                if (data?.detail) mensagem = data.detail;
                else if (data?.data_hora) mensagem = `Data/hora: ${data.data_hora}`;
                else if (data?.msg) mensagem = data.msg;
                else if (typeof data === 'string') mensagem = data;
                setTdMensagem(mensagem);
            }
        }
    };

    // ── Submeter pedido de informação (Lead) ────────────────────────────────
    const submeterLead = async (e) => {
        e.preventDefault();
        setLeadMensagem('');
        try {
            await axios.post(
                '/api/leads/',
                { veiculo: parseInt(id), ...leadForm },
                { headers: { 'X-CSRFToken': getCSRFToken() } }
            );
            setLeadMensagem('Pedido enviado! Entraremos em contacto em breve.');
            setLeadForm({ nome: '', email: '', telefone: '', mensagem: '' });
            setMostrarLead(false);
        } catch (err) {
            setLeadMensagem(
                err.response?.data?.detail ||
                err.response?.data?.msg ||
                'Erro ao enviar pedido.'
            );
        }
    };

    // ── Descarregar PDF da ficha técnica ────────────────────────────────────
    const descarregarPDF = () => {
        // Usa path absoluto — o proxy do Vite reencaminha para o Django
        window.open(`/api/vehicles/${id}/pdf/`, '_blank');
    };

    // ── Submeter avaliação ───────────────────────────────────────────────────
    const submeterReview = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                '/api/reviews/',
                { veiculo: parseInt(id), classificacao: novaClassif, comentario: novoComent },
                { headers: { 'X-CSRFToken': getCSRFToken() } }
            );
            setReviews(prev => [...prev, res.data]);
            setMinhaReview(res.data);
            setReviewMensagem('Avaliação submetida com sucesso!');
            setNovoComent('');
        } catch (err) {
            setReviewMensagem(
                err.response?.data?.detail ||
                err.response?.data?.msg ||
                'Erro ao submeter avaliação. Verifica se já tens um test-drive concluído para este veículo.'
            );
        }
    };

    // ── Renderização condicional enquanto carrega ────────────────────────────
    if (loading) return <Container className="mt-5"><p>A carregar...</p></Container>;
    if (erro) return <Container className="mt-5"><p className="text-danger">{erro}</p></Container>;
    if (!veiculo) return null;

    return (
        <Container className="my-4">
            {/* Botão de voltar — navigate(-1) vai para a página anterior no histórico */}
            <Button color="secondary" outline size="sm" className="mb-3" onClick={() => navigate(-1)}>
                ← Voltar
            </Button>

            <Row>
                {/* ── Galeria de fotos ──────────────────────────────────────── */}
                <Col md="6" className="mb-4">
                    {(veiculo.fotos?.length || 0) > 0 ? (
                        <div>
                            <img
                                src={veiculo.fotos[fotoIdx]?.foto?.startsWith('http')
                                    ? veiculo.fotos[fotoIdx].foto
                                    : `${fotoBase}${veiculo.fotos[fotoIdx]?.foto || ''}`}
                                alt={`${veiculo.marca} ${veiculo.modelo}`}
                                style={{ width: '100%', height: '350px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                            {veiculo.fotos.length > 1 && (
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <Button size="sm" color="secondary" onClick={() => mudarFoto(-1)}>&#10094;</Button>
                                    <span className="text-muted small">{fotoIdx + 1} / {veiculo.fotos.length}</span>
                                    <Button size="sm" color="secondary" onClick={() => mudarFoto(1)}>&#10095;</Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-light d-flex justify-content-center align-items-center"
                            style={{ height: '350px', borderRadius: '8px' }}>
                            <span className="text-muted">Sem imagens</span>
                        </div>
                    )}
                </Col>

                {/* ── Informação do veículo ─────────────────────────────────── */}
                <Col md="6">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h2 className="fw-bold mb-0">{veiculo.marca} {veiculo.modelo}</h2>
                        <Badge color={COR_ESTADO_VEICULO[veiculo.estado] || 'secondary'} className="ms-2 mt-1">
                            {LABEL_ESTADO_VEICULO[veiculo.estado] || veiculo.estado}
                        </Badge>
                    </div>

                    <h3 className="text-primary fw-bold mb-3">{veiculo.preco} €</h3>

                    <Table borderless size="sm" className="mb-3">
                        <tbody>
                            <tr>
                                <th style={{ width: '40%' }}>Ano</th>
                                <td>{veiculo.ano}</td>
                            </tr>
                            <tr>
                                <th>Quilometragem</th>
                                <td>{Number(veiculo.quilometragem).toLocaleString('pt-PT')} km</td>
                            </tr>
                            <tr>
                                <th>Avaliação</th>
                                <td>
                                    {veiculo.media_classificacao
                                        ? `${veiculo.media_classificacao} ⭐ (${veiculo.total_reviews} avaliações)`
                                        : 'Sem avaliações'}
                                </td>
                            </tr>
                        </tbody>
                    </Table>

                    {veiculo.descricao && (
                        <p className="text-muted mb-3">{veiculo.descricao}</p>
                    )}

                    {/* Botão de favorito — só para utilizadores autenticados */}
                    {isLoggedIn && (
                        <Button
                            color={favorito ? 'warning' : 'outline-warning'}
                            className="me-2 mb-2"
                            onClick={toggleFavorito}
                            disabled={favLoading}
                        >
                            {favLoading ? '...' : (favorito ? '♥ Nos Favoritos' : '♡ Adicionar aos Favoritos')}
                        </Button>
                    )}
                    {favMensagem && (
                        <p className={`small mb-2 ${favMensagem.includes('Erro') || favMensagem.includes('expirada') ? 'text-danger' : 'text-success'}`}>
                            {favMensagem}
                        </p>
                    )}

                    {/* Botão de test-drive — só se disponível e autenticado */}
                    {isLoggedIn && veiculo.estado === 'disponivel' && (
                        <Button
                            color="primary"
                            className="me-2 mb-2"
                            onClick={() => setMostrarTD(!mostrarTD)}
                        >
                            Agendar Test-Drive
                        </Button>
                    )}

                    {/* Pedido de informação — qualquer pessoa pode pedir */}
                    {veiculo.estado !== 'vendido' && (
                        <Button
                            color="info"
                            outline
                            className="me-2 mb-2"
                            onClick={() => setMostrarLead(!mostrarLead)}
                        >
                            Pedir Informação
                        </Button>
                    )}

                    {/* Descarregar ficha técnica em PDF */}
                    <Button
                        color="secondary"
                        outline
                        className="mb-2"
                        onClick={descarregarPDF}
                    >
                        📄 Ficha Técnica (PDF)
                    </Button>

                    {veiculo.estado === 'reservado' && (
                        <p className="text-warning small mt-2 mb-0">
                            ⚠ Este veículo está reservado para um test-drive. Não é possível agendar novos test-drives até que o atual termine.
                        </p>
                    )}

                    {!isLoggedIn && (
                        <p className="text-muted small mt-2">
                            <Link to="/login">Inicia sessão</Link> para adicionar aos favoritos ou agendar um test-drive.
                        </p>
                    )}

                    {/* Formulário de test-drive — aparece quando o botão é clicado */}
                    {mostrarTD && (
                        <Form onSubmit={submeterTestDrive} className="mt-3 p-3 border rounded bg-light">
                            <h6 className="fw-bold mb-3">Agendar Test-Drive</h6>
                            <FormGroup>
                                <Label>Data e Hora</Label>
                                <Input
                                    type="datetime-local"
                                    value={dataHora}
                                    onChange={e => setDataHora(e.target.value)}
                                    required
                                />
                            </FormGroup>
                            <Button color="primary" size="sm" type="submit" className="me-2">
                                Confirmar
                            </Button>
                            <Button color="secondary" size="sm" onClick={() => setMostrarTD(false)}>
                                Cancelar
                            </Button>
                        </Form>
                    )}

                    {tdMensagem && (
                        <p className={`mt-2 small ${tdMensagem.includes('sucesso') ? 'text-success' : 'text-danger'}`}>
                            {tdMensagem}
                        </p>
                    )}

                    {/* Formulário de pedido de informação (Lead) */}
                    {mostrarLead && (
                        <Form onSubmit={submeterLead} className="mt-3 p-3 border rounded bg-light">
                            <h6 className="fw-bold mb-3">Pedir Mais Informação</h6>
                            <FormGroup>
                                <Label>Nome</Label>
                                <Input
                                    type="text"
                                    value={leadForm.nome}
                                    onChange={e => setLeadForm({ ...leadForm, nome: e.target.value })}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={leadForm.email}
                                    onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Telefone <span className="text-muted small">(opcional)</span></Label>
                                <Input
                                    type="tel"
                                    value={leadForm.telefone}
                                    onChange={e => setLeadForm({ ...leadForm, telefone: e.target.value })}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Mensagem</Label>
                                <Input
                                    type="textarea"
                                    rows="3"
                                    value={leadForm.mensagem}
                                    onChange={e => setLeadForm({ ...leadForm, mensagem: e.target.value })}
                                    placeholder={`Olá, gostaria de saber mais sobre o ${veiculo.marca} ${veiculo.modelo}...`}
                                    required
                                />
                            </FormGroup>
                            <Button color="info" size="sm" type="submit" className="me-2">
                                Enviar Pedido
                            </Button>
                            <Button color="secondary" size="sm" onClick={() => setMostrarLead(false)}>
                                Cancelar
                            </Button>
                        </Form>
                    )}

                    {leadMensagem && (
                        <p className={`mt-2 small ${leadMensagem.includes('enviado') ? 'text-success' : 'text-danger'}`}>
                            {leadMensagem}
                        </p>
                    )}
                </Col>
            </Row>

            {/* ── Secção de avaliações ──────────────────────────────────────── */}
            <hr className="my-4" />
            <h4 className="mb-3">Avaliações</h4>

            {reviews.length === 0 ? (
                <p className="text-muted">Ainda não há avaliações para este veículo.</p>
            ) : (
                reviews.map(review => (
                    <Card key={review.id} className="mb-3 border-0 shadow-sm">
                        <CardBody>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <strong>{review.utilizador.username}</strong>
                                <span>{'⭐'.repeat(review.classificacao)}</span>
                            </div>
                            <p className="text-muted small mb-0">{review.comentario}</p>
                        </CardBody>
                    </Card>
                ))
            )}

            {/* Formulário para deixar avaliação — só se tem test-drive concluído e ainda não avaliou */}
            {isLoggedIn && temTDConcluido && !minhaReview && (
                <div className="mt-3 p-3 border rounded bg-light">
                    <h6 className="fw-bold mb-3">Deixar Avaliação</h6>
                    <Form onSubmit={submeterReview}>
                        <FormGroup>
                            <Label>Classificação (1 a 5 estrelas)</Label>
                            <Input
                                type="number"
                                min="1"
                                max="5"
                                value={novaClassif}
                                onChange={e => setNovaClassif(parseInt(e.target.value))}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Comentário</Label>
                            <Input
                                type="textarea"
                                rows="3"
                                value={novoComent}
                                onChange={e => setNovoComent(e.target.value)}
                                required
                            />
                        </FormGroup>
                        <Button color="success" size="sm" type="submit">
                            Submeter Avaliação
                        </Button>
                    </Form>
                </div>
            )}

            {isLoggedIn && !temTDConcluido && (
                <p className="text-muted small mt-2">
                    Só podes avaliar este veículo após teres realizado um test-drive concluído.
                </p>
            )}

            {reviewMensagem && (
                <p className={`mt-2 small ${reviewMensagem.includes('sucesso') ? 'text-success' : 'text-danger'}`}>
                    {reviewMensagem}
                </p>
            )}
        </Container>
    );
}
