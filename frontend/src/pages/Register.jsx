import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

export default function Register() {
    const navigate = useNavigate();
    const [role, setRole] = useState('CLIENT'); // CLIENT awla THERAPIST
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone_number: '',
        date_of_birth: '',
        specialty: '',
        session_price: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = role === 'CLIENT' ? 'users/register/client/' : 'users/register/therapist/';

        try {
            await API.post(endpoint, formData);
            alert('Compte créé avec succès ! Connectez-vous.');
            navigate('/login');
        } catch (err) {
            setError('Erreur lors de la création du compte. Vérifiez les informations.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.card}>
                <h2>Créer un compte Sakina</h2>
                {error && <p style={styles.error}>{error}</p>}

                {/* Role Selector */}
                <div style={styles.inputGroup}>
                    <label>Type de compte:</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
                        <option value="CLIENT">Mostafid (Client)</option>
                        <option value="THERAPIST">Mo3alij (Therapist)</option>
                    </select>
                </div>

                <div style={styles.inputGroup}>
                    <label>Username</label>
                    <input type="text" name="username" onChange={handleChange} required style={styles.input} />
                </div>

                <div style={styles.inputGroup}>
                    <label>Email</label>
                    <input type="email" name="email" onChange={handleChange} required style={styles.input} />
                </div>

                <div style={styles.inputGroup}>
                    <label>Mot de passe</label>
                    <input type="password" name="password" onChange={handleChange} required style={styles.input} />
                </div>

                <div style={styles.inputGroup}>
                    <label>Téléphone</label>
                    <input type="text" name="phone_number" onChange={handleChange} style={styles.input} />
                </div>

                {/* Champs spécifiques Client */}
                {role === 'CLIENT' && (
                    <div style={styles.inputGroup}>
                        <label>Date de naissance</label>
                        <input type="date" name="date_of_birth" onChange={handleChange} style={styles.input} />
                    </div>
                )}

                {/* Champs spécifiques Therapist */}
                {role === 'THERAPIST' && (
                    <>
                        <div style={styles.inputGroup}>
                            <label>Spécialité</label>
                            <input type="text" name="specialty" placeholder="Ex: Anxiété, Dépression..." onChange={handleChange} required style={styles.input} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label>Prix de la séance (DH)</label>
                            <input type="number" name="session_price" onChange={handleChange} required style={styles.input} />
                        </div>
                    </>
                )}

                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'Création...' : 'S\'inscrire'}
                </button>

                <p style={{ marginTop: '1rem', fontSize: '14px' }}>
                    Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
                </p>
            </form>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0', backgroundColor: '#f4f6f9' },
    card: { padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backgroundColor: '#fff', width: '350px' },
    inputGroup: { marginBottom: '1rem', display: 'flex', flexDirection: 'column' },
    input: { padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' },
    button: { width: '100%', padding: '10px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    error: { color: 'red', fontSize: '14px', marginBottom: '1rem' }
};