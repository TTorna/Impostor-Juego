import { useState, useEffect } from 'react';
import Card from './Card';
import { categories } from '../data/categories';

export default function GameScreen({ config, onEndGame }) {
    const [players, setPlayers] = useState([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [isCardRevealed, setIsCardRevealed] = useState(false);
    const [gamePhase, setGamePhase] = useState('pass'); // 'pass' | 'reveal' | 'finished'

    useEffect(() => {
        // Initialize game
        const { playerCount, impostorCount, selectedCategories, showHints } = config;

        // Select random category and word object
        const randomCatId = selectedCategories[Math.floor(Math.random() * selectedCategories.length)];
        const category = categories.find(c => c.id === randomCatId);
        const wordObj = category.words[Math.floor(Math.random() * category.words.length)];

        // Create players array
        let newPlayers = Array(playerCount).fill({ type: 'civilian', word: wordObj.word });

        // Assign impostors
        let impostorsAssigned = 0;
        while (impostorsAssigned < impostorCount) {
            const idx = Math.floor(Math.random() * playerCount);
            if (newPlayers[idx].type !== 'impostor') {
                // Select a random hint from the word's hints
                const randomHint = wordObj.hints[Math.floor(Math.random() * wordObj.hints.length)];

                newPlayers[idx] = {
                    type: 'impostor',
                    hint: showHints ? randomHint : null
                };
                impostorsAssigned++;
            }
        }

        setPlayers(newPlayers);
    }, [config]);

    const handleNext = () => {
        setIsCardRevealed(false);
        if (currentPlayerIndex < players.length - 1) {
            setGamePhase('pass');
            setCurrentPlayerIndex(prev => prev + 1);
        } else {
            setGamePhase('finished');
        }
    };

    if (players.length === 0) return null;

    if (gamePhase === 'finished') {
        return (
            <div className="card animate-fade-in" style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>¡Juego Iniciado!</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Todos han visto su carta. ¡Que comience el debate!
                </p>
                <button className="btn-primary" onClick={onEndGame}>
                    Nueva Partida
                </button>
            </div>
        );
    }

    if (gamePhase === 'pass') {
        return (
            <div className="card animate-fade-in" style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Jugador {currentPlayerIndex + 1}</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Pasa el dispositivo al Jugador {currentPlayerIndex + 1}
                </p>
                <button className="btn-primary" onClick={() => setGamePhase('reveal')}>
                    Soy el Jugador {currentPlayerIndex + 1}
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ width: '100%' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Jugador {currentPlayerIndex + 1}</h2>
            <Card
                content={players[currentPlayerIndex].word}
                type={players[currentPlayerIndex].type}
                hint={players[currentPlayerIndex].hint}
                isRevealed={isCardRevealed}
                onReveal={() => setIsCardRevealed(!isCardRevealed)}
                onNext={handleNext}
            />
        </div>
    );
}
