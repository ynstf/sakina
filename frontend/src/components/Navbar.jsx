import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.brand}>Sakina</div>

            <div style={styles.links}>
                <NavLink
                    to="/home"
                    style={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                >
                    Home
                </NavLink>

                <NavLink
                    to="/dashboard"
                    style={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/me"
                    style={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
                >
                    Me
                </NavLink>
            </div>

            <button onClick={handleLogout} style={styles.logoutBtn}>
                Déconnexion
            </button>
        </nav>
    );
}

const styles = {
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '20px',
    },
    brand: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#22c55e',
    },
    links: {
        display: 'flex',
        gap: '24px',
    },
    link: {
        textDecoration: 'none',
        color: '#4b5563',
        fontWeight: '500',
        paddingBottom: '4px',
    },
    activeLink: {
        textDecoration: 'none',
        color: '#22c55e',
        fontWeight: 'bold',
        borderBottom: '2px solid #22c55e',
        paddingBottom: '4px',
    },
    logoutBtn: {
        backgroundColor: '#ef4444',
        color: '#fff',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
    }
};