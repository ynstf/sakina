import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

export default function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await API.post('users/login/', formData);

            // Stocker les tokens f localStorage
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('username', formData.username);
            // Redirect l Dashboard aw Home mn ba3d Login
            navigate('/dashboard');
        } catch (err) {
            setError('Nom d\'utilisateur ou mot de passe incorrect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.card}>
                <h2>Se Connecter à Sakina</h2>
                {error && <p style={styles.error}>{error}</p>}

                <div style={styles.inputGroup}>
                    <label>Username</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label>Mot de passe</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>

                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'Connexion...' : 'Se Connecter'}
                </button>
                <p style={{ marginTop: '1rem', fontSize: '14px' }}>
                    Pas encore de compte ? <Link to="/register">S'inscrire</Link>
                </p>
            </form>

        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f9' },
    card: { padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backgroundColor: '#fff', width: '320px' },
    inputGroup: { marginBottom: '1rem', display: 'flex', flexDirection: 'column' },
    input: { padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' },
    button: { width: '100%', padding: '10px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    error: { color: 'red', fontSize: '14px', marginBottom: '1rem' }
};