import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const URL_USER = 'http://localhost:8000/api/user/';

const UserContext = createContext(null);


export const useUserContext = () => useContext(UserContext);

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        axios.get(URL_USER, { withCredentials: true })
            .then(response => {
                setUser(response.data);
                setCarregando(false);
            })
            .catch(() => {
                setUser(null);
                setCarregando(false);
            });
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, carregando }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;