import { useState } from 'react';
import { categories } from '../data/categories';

export default function SetupScreen({ onStartGame }) {
    const [playerCount, setPlayerCount] = useState(4);
    const [impostorCount, setImpostorCount] = useState(1);
    const [selectedCategories, setSelectedCategories] = useState(['lugares']);
    const [showHints, setShowHints] = useState(false);

    const [error, setError] = useState('');

    const toggleCategory = (catId) => {
        setSelectedCategories(prev => {
            if (prev.includes(catId)) {
                // Prevent deselecting the last category
                if (prev.length === 1) return prev;
                return prev.filter(id => id !== catId);
            }
            return [...prev, catId];
        });
    };

    const handleStart = () => {
        if (playerCount < 3) {
            setError('Se necesitan al menos 3 jugadores para jugar.');
            return;
        }
        if (impostorCount > playerCount) {
            setError('La cantidad de impostores debe ser menor a la de jugadores.');
            return;
        }
        if (selectedCategories.length === 0) {
            setError('Debes seleccionar al menos una categoría.');
            return;
        }

        setError('');
        onStartGame({
            playerCount,
            impostorCount,
            selectedCategories,
            showHints
        });
    };

    return (
        <div className="card animate-fade-in">
            <div className="input-group">
                <label>Cantidad de Jugadores</label>
                <input
                    type="number"
                    min="3"
                    max="20"
                    value={playerCount}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setPlayerCount(val);
                        setError('');
                    }}
                />
            </div>

            <div className="input-group">
                <label>Cantidad de Impostores</label>
                <input
                    type="number"
                    min="1"
                    max={playerCount - 1}
                    value={impostorCount}
                    onChange={(e) => {
                        setImpostorCount(parseInt(e.target.value));
                        setError('');
                    }}
                />
            </div>

            <div className="input-group">
                <label>Categorías</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => toggleCategory(cat.id)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                background: selectedCategories.includes(cat.id) ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: '1px solid',
                                borderColor: selectedCategories.includes(cat.id) ? 'var(--accent-color)' : 'rgba(255,255,255,0.2)',
                            }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="input-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ marginBottom: 0 }}>Pistas para Impostores</label>
                <div
                    onClick={() => setShowHints(!showHints)}
                    style={{
                        width: '3rem',
                        height: '1.75rem',
                        background: showHints ? 'var(--accent-color)' : 'rgba(255,255,255,0.2)',
                        borderRadius: '9999px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    <div style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        background: 'white',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '0.25rem',
                        left: showHints ? '1.5rem' : '0.25rem',
                        transition: 'left 0.2s'
                    }} />
                </div>
            </div>

            {error && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #ef4444',
                    color: '#fca5a5',
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    fontSize: '0.875rem'
                }}>
                    {error}
                </div>
            )}

            <button className="btn-primary" onClick={handleStart}>
                Comenzar Juego
            </button>
        </div>
    );
}
