import { useState } from 'react';
import Card from './Card';

export default function OnlineGame({ socket, data, room }) {
    const [isRevealed, setIsRevealed] = useState(false);
    const isHost = room.hostId === socket.id;

    const handleRestart = () => {
        socket.emit('restart-game', { roomCode: room.code });
    };

    return (
        <div className="animate-fade-in" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Tu Rol</h2>
                <p style={{ color: 'var(--text-secondary)' }}>No muestres tu pantalla a nadie</p>
            </div>

            <Card
                content={data.word}
                type={data.type}
                hint={data.hint}
                isRevealed={isRevealed}
                onReveal={() => setIsRevealed(!isRevealed)}
                onNext={null} // No "next player" button in online mode
            />

            {isHost && (
                <div style={{ marginTop: '2rem' }}>
                    <button className="btn-primary" onClick={handleRestart}>
                        Nueva Partida
                    </button>
                </div>
            )}

            {!isHost && (
                <p style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.7 }}>
                    Esperando al anfitrión para reiniciar...
                </p>
            )}
        </div>
    );
}
