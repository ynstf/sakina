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
        <div className="sk-auth-page">
            {/* Same "sk-" design system as Login.jsx / HomeFeed.jsx, embedded here
                so this file stays self-contained. Class names shared with Login
                (sk-auth-*) keep the two auth screens visually identical. */}
            <style>{`
                .sk-auth-page {
                    --sk-bg: #F6F4EE;
                    --sk-surface: #FFFFFF;
                    --sk-border: #E1DCCE;
                    --sk-text: #1F2A24;
                    --sk-text-muted: #5B6660;
                    --sk-primary: #2F6F4E;
                    --sk-primary-hover: #275C41;
                    --sk-error: #B3261E;
                    --sk-error-bg: #FBEAE9;
                    --sk-focus-ring: rgba(47, 111, 78, 0.35);

                    min-height: 100vh;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    padding: 40px 24px;
                    background-color: var(--sk-bg);
                    box-sizing: border-box;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .sk-auth-page * {
                    box-sizing: border-box;
                }

                .sk-auth-card {
                    width: 100%;
                    max-width: 420px;
                    background-color: var(--sk-surface);
                    border: 1px solid var(--sk-border);
                    border-radius: 10px;
                    box-shadow: 0 8px 24px rgba(31, 42, 36, 0.08);
                    padding: 32px 24px;
                }

                .sk-auth-title {
                    margin: 0 0 24px;
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--sk-text);
                    text-align: center;
                }

                .sk-field {
                    margin-bottom: 16px;
                    display: flex;
                    flex-direction: column;
                }

                .sk-field label {
                    margin-bottom: 8px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--sk-text-muted);
                }

                .sk-field input,
                .sk-field select {
                    padding: 10px 12px;
                    font-size: 1rem;
                    font-family: inherit;
                    color: var(--sk-text);
                    background-color: var(--sk-surface);
                    border: 1px solid var(--sk-border);
                    border-radius: 6px;
                    transition: border-color 0.15s ease, box-shadow 0.15s ease;
                    width: 100%;
                }

                .sk-field select {
                    cursor: pointer;
                }

                .sk-field input:focus,
                .sk-field select:focus {
                    outline: none;
                    border-color: var(--sk-primary);
                    box-shadow: 0 0 0 3px var(--sk-focus-ring);
                }

                .sk-error {
                    color: var(--sk-error);
                    background-color: var(--sk-error-bg);
                    font-size: 0.875rem;
                    padding: 12px;
                    border-radius: 6px;
                    margin-bottom: 16px;
                }

                .sk-submit-btn {
                    width: 100%;
                    padding: 12px;
                    font-size: 1rem;
                    font-weight: 500;
                    color: #fff;
                    background-color: var(--sk-primary);
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background-color 0.15s ease;
                }

                .sk-submit-btn:hover:not(:disabled) {
                    background-color: var(--sk-primary-hover);
                }

                .sk-submit-btn:focus-visible {
                    outline: 3px solid var(--sk-focus-ring);
                    outline-offset: 2px;
                }

                .sk-submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .sk-auth-footer {
                    margin-top: 24px;
                    font-size: 0.875rem;
                    color: var(--sk-text-muted);
                    text-align: center;
                }

                .sk-auth-footer a {
                    color: var(--sk-primary);
                    font-weight: 500;
                    text-decoration: none;
                }

                .sk-auth-footer a:hover {
                    text-decoration: underline;
                }

                @media (prefers-reduced-motion: reduce) {
                    .sk-auth-page * {
                        transition-duration: 0.001ms !important;
                    }
                }

                /* Small phones */
                @media (max-width: 380px) {
                    .sk-auth-page {
                        padding: 24px 16px;
                    }
                    .sk-auth-card {
                        padding: 24px 16px;
                        box-shadow: none;
                        border: none;
                    }
                    .sk-auth-title {
                        font-size: 1.3rem;
                    }
                }

                /* Desktop */
                @media (min-width: 1024px) {
                    .sk-auth-card {
                        max-width: 460px;
                        padding: 40px 32px;
                    }
                }
            `}</style>

            <form onSubmit={handleSubmit} className="sk-auth-card">
                <h2 className="sk-auth-title">Créer un compte Sakina</h2>
                {error && <p className="sk-error">{error}</p>}

                {/* Role Selector */}
                <div className="sk-field">
                    <label htmlFor="role">Type de compte:</label>
                    <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="CLIENT">Mostafid (Client)</option>
                        <option value="THERAPIST">Mo3alij (Therapist)</option>
                    </select>
                </div>

                <div className="sk-field">
                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" name="username" onChange={handleChange} required />
                </div>

                <div className="sk-field">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" name="email" onChange={handleChange} required />
                </div>

                <div className="sk-field">
                    <label htmlFor="password">Mot de passe</label>
                    <input id="password" type="password" name="password" onChange={handleChange} required />
                </div>

                <div className="sk-field">
                    <label htmlFor="phone_number">Téléphone</label>
                    <input id="phone_number" type="text" name="phone_number" onChange={handleChange} />
                </div>

                {/* Champs spécifiques Client */}
                {role === 'CLIENT' && (
                    <div className="sk-field">
                        <label htmlFor="date_of_birth">Date de naissance</label>
                        <input id="date_of_birth" type="date" name="date_of_birth" onChange={handleChange} />
                    </div>
                )}

                {/* Champs spécifiques Therapist */}
                {role === 'THERAPIST' && (
                    <>
                        <div className="sk-field">
                            <label htmlFor="specialty">Spécialité</label>
                            <input
                                id="specialty"
                                type="text"
                                name="specialty"
                                placeholder="Ex: Anxiété, Dépression..."
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="sk-field">
                            <label htmlFor="session_price">Prix de la séance (DH)</label>
                            <input id="session_price" type="number" name="session_price" onChange={handleChange} required />
                        </div>
                    </>
                )}

                <button type="submit" disabled={loading} className="sk-submit-btn">
                    {loading ? 'Création...' : 'S\'inscrire'}
                </button>

                <p className="sk-auth-footer">
                    Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
                </p>
            </form>
        </div>
    );
}