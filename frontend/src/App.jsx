import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserProvider from './context/UserContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VehicleDetail from './pages/VehicleDetail';
import PurchasePage from './pages/PurchasePage';
import TestDrivePage from './pages/TestDrivePage';
import ReviewPage from './pages/ReviewPage';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import './App.css';

function App() {
    return (
        <UserProvider>
            <BrowserRouter>
                <div className="app">
                    <Header />
                    <main className="app-main">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/vehicles/:id" element={<VehicleDetail />} />
                            <Route path="/vehicles/:id/purchase" element={<PurchasePage />} />
                            <Route path="/vehicles/:id/testdrive" element={<TestDrivePage />} />
                            <Route path="/vehicles/:id/review" element={<ReviewPage />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/admin" element={<Admin />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </BrowserRouter>
        </UserProvider>
    );
}

export default App;