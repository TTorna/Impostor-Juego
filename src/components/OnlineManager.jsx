import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import OnlineLobby from './OnlineLobby';
import OnlineRoom from './OnlineRoom';
import OnlineGame from './OnlineGame';

import WhoIsWhoGame from './WhoIsWhoGame';

export default function OnlineManager({ gameType, onBack }) {
    const [socket, setSocket] = useState(null);
    const [view, setView] = useState('lobby'); // lobby, room, game
    const [roomData, setRoomData] = useState(null);
    const [playerData, setPlayerData] = useState(null); // My specific game data
    const [error, setError] = useState('');

    useEffect(() => {
        // Connect to the server
        // In production, it connects to the same origin.
        // In dev, we might need to specify localhost:3000 if running separately, 
        // but with the proxy or concurrently setup, it should work.
        // Let's try auto-discovery.
        const newSocket = io(window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin);

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server');
            setError('');
        });

        newSocket.on('connect_error', (err) => {
            console.error('Connection error:', err);
            setError('No se pudo conectar al servidor. Asegúrate de que esté corriendo.');
        });

        newSocket.on('room-created', ({ roomCode, isHost }) => {
            // Room update will follow
        });

        newSocket.on('update-room', (room) => {
            setRoomData(room);
            if (room.gameState.phase === 'lobby') {
                setView('room');
            }
        });

        newSocket.on('game-started', (data) => {
            setPlayerData(data);
            setView('game');
        });

        newSocket.on('game-reset', () => {
            setView('room');
            setPlayerData(null);
        });

        newSocket.on('error', (msg) => {
            alert(msg);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    if (!socket) return <div className="text-center">Conectando...</div>;

    return (
        <div className="w-full max-w-md mx-auto">
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-4 text-center">
                    {error}
                </div>
            )}

            {view === 'lobby' && (
                <OnlineLobby socket={socket} gameType={gameType} onBack={onBack} />
            )}

            {view === 'room' && roomData && (
                <OnlineRoom socket={socket} room={roomData} onLeave={onBack} />
            )}

            {view === 'game' && playerData && (
                gameType === 'impostor' ? (
                    <OnlineGame socket={socket} data={playerData} room={roomData} />
                ) : (
                    <WhoIsWhoGame socket={socket} data={playerData} room={roomData} onLeave={onBack} />
                )
            )}
        </div>
    );
}
