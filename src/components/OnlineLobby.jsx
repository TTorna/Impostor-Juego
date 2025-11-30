import { useState } from 'react';

export default function OnlineLobby({ socket, onBack }) {
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');

    const handleCreate = () => {
        if (!playerName.trim()) return alert('Ingresa tu nombre');
        socket.emit('create-room', { playerName });
    };

    const handleJoin = () => {
        if (!playerName.trim()) return alert('Ingresa tu nombre');
        if (!roomCode.trim()) return alert('Ingresa el código de sala');
        socket.emit('join-room', { roomCode: roomCode.toUpperCase(), playerName });
    };

    return (
        <div className="card animate-fade-in">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Modo Online</h2>

            <div className="input-group">
                <label>Tu Nombre</label>
                <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Ej: Toto"
                />
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0', paddingTop: '2rem' }}>
                <button className="btn-primary" onClick={handleCreate} style={{ marginBottom: '1rem' }}>
                    Crear Sala
                </button>

                <div style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--text-secondary)' }}>O</div>

                <div className="input-group">
                    <label>Código de Sala</label>
                    <input
                        type="text"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        placeholder="Ej: ABC123"
                        maxLength={6}
                        style={{ textAlign: 'center', letterSpacing: '0.2em', textTransform: 'uppercase' }}
                    />
                </div>

                <button
                    className="btn-primary"
                    onClick={handleJoin}
                    style={{ background: 'var(--secondary-gradient)' }}
                >
                    Unirse a Sala
                </button>
            </div>

            <button
                onClick={onBack}
                style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    marginTop: '1rem'
                }}
            >
                Volver al Menú
            </button>
        </div>
    );
}
