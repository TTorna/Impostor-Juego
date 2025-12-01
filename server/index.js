import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for development/tunneling
        methods: ["GET", "POST"]
    }
});

// Game State Storage (In-memory)
const rooms = new Map();

// Helper to generate room code
const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Create Room
    socket.on('create-room', ({ playerName, gameType }) => {
        const roomCode = generateRoomCode();
        const newRoom = {
            code: roomCode,
            gameType: gameType || 'impostor', // Default to impostor for backward compatibility
            hostId: socket.id,
            players: [{ id: socket.id, name: playerName, isHost: true }],
            settings: {
                playerCount: 4,
                impostorCount: 1,
                selectedCategories: ['lugares'],
                showHints: false
            },
            gameState: {
                phase: 'lobby', // lobby, playing
                playersData: [] // { id, name, type, word, hint }
            }
        };

        rooms.set(roomCode, newRoom);
        socket.join(roomCode);

        socket.emit('room-created', { roomCode, isHost: true });
        io.to(roomCode).emit('update-room', newRoom);
    });

    // Join Room
    socket.on('join-room', ({ roomCode, playerName }) => {
        const room = rooms.get(roomCode);

        if (!room) {
            socket.emit('error', 'Sala no encontrada');
            return;
        }

        if (room.gameState.phase !== 'lobby') {
            socket.emit('error', 'El juego ya comenzó');
            return;
        }

        const existingPlayer = room.players.find(p => p.name === playerName);
        if (existingPlayer) {
            socket.emit('error', 'Ya existe un jugador con ese nombre');
            return;
        }

        const newPlayer = { id: socket.id, name: playerName, isHost: false };
        room.players.push(newPlayer);
        socket.join(roomCode);

        io.to(roomCode).emit('update-room', room);
    });

    // Update Settings (Host only)
    socket.on('update-settings', ({ roomCode, settings }) => {
        const room = rooms.get(roomCode);
        if (room && room.hostId === socket.id) {
            room.settings = settings;
            io.to(roomCode).emit('update-room', room);
        }
    });

    // Start Game
    socket.on('start-game', ({ roomCode, gameData }) => {
        const room = rooms.get(roomCode);
        if (room && room.hostId === socket.id) {
            room.gameState.phase = 'playing';
            room.gameState.playersData = gameData;

            // Send specific data to each player
            gameData.forEach(pData => {
                io.to(pData.id).emit('game-started', pData);
            });

            // Notify everyone game started (for UI state)
            io.to(roomCode).emit('room-game-start');
            if (room && room.hostId === socket.id) {
                room.gameState.phase = 'lobby';
                room.gameState.playersData = [];
                io.to(roomCode).emit('update-room', room);
                io.to(roomCode).emit('game-reset');
            }
        });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove player from rooms
        rooms.forEach((room, code) => {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                const wasHost = room.players[playerIndex].isHost;
                room.players.splice(playerIndex, 1);

                if (room.players.length === 0) {
                    rooms.delete(code);
                } else {
                    if (wasHost) {
                        room.players[0].isHost = true;
                        room.hostId = room.players[0].id;
                    }
                    io.to(code).emit('update-room', room);
                }
            }
        });
    });
});

// Handle React routing, return all requests to React app
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
