import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'Utilisateur';

    const handleLogout = () => {
        // Nettoyer localstorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');

        // Redirection l-login
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>Bienvenue <span style={{ color: '#2e7d32' }}>{username}</span> sur votre espace Sakina !</h2>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                    Se Déconnecter
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f9' },
    card: { padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backgroundColor: '#fff', textAlign: 'center' },
    logoutBtn: { marginTop: '1.5rem', padding: '10px 20px', backgroundColor: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};