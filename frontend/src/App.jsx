import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import axios from "axios";
import Login from './components/Login';
import Registo from './components/Register';
import RotaProtegida from './components/RotaProtegida';
import VehicleDetail from './pages/VehicleDetail';
import Favorites from './pages/Favorites';
import MinhaArea from './pages/MinhaArea';
import StaffArea from './pages/StaffArea';

// Com o proxy do Vite (vite.config.js), todos os pedidos /api/* e /media/*
// são reencaminhados para o Django automaticamente.
// NÃO definir baseURL — assim axios usa caminhos relativos à origem do Vite
// (localhost:5173), o proxy faz o resto, e o cookie CSRF fica acessível em JS.
axios.defaults.withCredentials = true;

// Interceptor: se o backend responder com 401 ou 403 numa request que requer auth
// e tivermos um username em localStorage, isso significa que a sessão expirou ou
// o user nunca autenticou no backend. Limpa o estado para forçar novo login.
// Excepção: pedidos a /api/login/ devem manter o erro (são esperados em login falhado).
axios.interceptors.response.use(
  response => response,
  error => {
    const url = error.config?.url || '';
    const status = error.response?.status;
    const ehLogin = url.includes('api/login/') || url.includes('api/signup/');

    if ((status === 401 || status === 403) && !ehLogin && localStorage.getItem('username')) {
      localStorage.removeItem('username');
      localStorage.removeItem('is_staff');
      window.dispatchEvent(new Event('storage'));
    }
    return Promise.reject(error);
  }
);

function Sobre() {
  return (
    <div className="container mt-5">
      <h2>Sobre o StandCarros</h2>
      <p>A sua plataforma de confiança para encontrar o veículo ideal.</p>
    </div>
  );
}

function App() {
  // No arranque:
  //  1. Garante o cookie csrftoken via /api/csrf/ (necessário para POSTs autenticados)
  //  2. Valida a sessão: se o localStorage diz que estamos logged in mas o backend
  //     já não reconhece, limpamos para evitar 403 silenciosos por toda a app.
  useEffect(() => {
    (async () => {
      try {
        await axios.get('/api/csrf/');
      } catch (err) {
        console.error('Falha ao obter CSRF:', err);
        return;
      }
      // Só valida a sessão se o utilizador acha que está autenticado
      if (localStorage.getItem('username')) {
        try {
          const res = await axios.get('/api/user/');
          // Re-sincroniza is_staff caso tenha mudado no backend
          localStorage.setItem('is_staff', res.data.is_staff);
        } catch (err) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            // Sessão inválida — limpa localStorage e força recarregamento do Header
            localStorage.removeItem('username');
            localStorage.removeItem('is_staff');
            window.dispatchEvent(new Event('storage'));
            console.warn('Sessão inválida no servidor — localStorage limpo.');
          }
        }
      }
    })();
  }, []);

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registo" element={<Registo />} />
            <Route path="/veiculo/:id" element={<VehicleDetail />} />
            <Route path="/favoritos" element={
              <RotaProtegida clienteOnly={true}><Favorites /></RotaProtegida>
            } />
            <Route path="/minha-area" element={
              <RotaProtegida clienteOnly={true}><MinhaArea /></RotaProtegida>
            } />
            <Route path="/staff" element={
              <RotaProtegida staffOnly={true}><StaffArea /></RotaProtegida>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;