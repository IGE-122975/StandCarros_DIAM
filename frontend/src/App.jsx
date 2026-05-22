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

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

function Sobre() {
  return (
    <div className="container mt-5">
      <h2>Sobre o StandCarros</h2>
      <p>A sua plataforma de confiança para encontrar o veículo ideal.</p>
    </div>
  );
}

function App() {
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
              <RotaProtegida><Favorites /></RotaProtegida>
            } />
            <Route path="/minha-area" element={
              <RotaProtegida><MinhaArea /></RotaProtegida>
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