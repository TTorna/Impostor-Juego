import { useState, useEffect } from 'react';
import WhoIsWhoCard from './WhoIsWhoCard';

export default function WhoIsWhoGame({ socket, data, room, onLeave }) {
    const isHost = room.hostId === socket.id;
    const [revealed, setRevealed] = useState(false);

    // data is { id, playersData: [ { id, name, character } ] }
    // data is { id, playersData: [ { id, name, character } ] }

    if (!data || !data.playersData) {
        return <div className="text-center p-4">Error: No se recibieron datos del juego</div>;
    }

    // We need to find the list of players
    const playersList = data.playersData;
    const myId = socket.id;

    useEffect(() => {
        socket.on('cards-revealed', () => {
            setRevealed(true);
        });

        return () => {
            socket.off('cards-revealed');
        };
    }, [socket]);

    const handleRestart = () => {
        socket.emit('restart-game', { roomCode: room.code });
    };

    return (
        <div className="animate-fade-in" style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ marginBottom: '2rem' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', // Increased from 140px
                    gap: '2rem', // Increased gap
                    justifyItems: 'center'
                }}>
                    {playersList.map((p) => {
                        const isMe = p.id === myId;
                        // Show character if it's NOT me, OR if revealed
                        const showCharacter = !isMe || revealed;

                        return (
                            <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: isMe ? 'var(--accent-color)' : 'white' }}>
                                    {p.name} {isMe && '(Tú)'}
                                </div>
                                <WhoIsWhoCard
                                    content={showCharacter ? p.character : '???'}
                                    eliminated={false}
                                    onToggle={() => { }} // No interaction needed for now
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {isHost && (
                <div style={{ marginTop: '2rem', paddingBottom: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        className="btn-primary"
                        onClick={handleRestart}
                    >
                        Nuevo Juego
                    </button>
                </div>
            )}
            <button
                onClick={onLeave}
                style={{
                    width: '100%',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                Salir
            </button>
        </div>
    );
}
