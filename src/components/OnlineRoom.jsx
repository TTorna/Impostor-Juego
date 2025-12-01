import { useState } from 'react';
import { categories } from '../data/categories';

export default function OnlineRoom({ socket, room, onLeave }) {
    const isHost = room.hostId === socket.id;
    const isWhoIsWho = room.gameType === 'whoiswho';

    const [settings, setSettings] = useState(() => {
        if (isHost) {
            const savedImpostors = parseInt(localStorage.getItem('impostor_online_impostorCount'));
            const savedCats = localStorage.getItem('impostor_online_categories');
            const savedHints = localStorage.getItem('impostor_online_showHints');

            let parsedCats = room.settings.selectedCategories;
            try {
                if (savedCats) {
                    const parsed = JSON.parse(savedCats);
                    if (Array.isArray(parsed)) parsedCats = parsed;
                }
            } catch (e) {
                console.error('Error parsing saved categories', e);
            }

            return {
                ...room.settings,
                impostorCount: savedImpostors || room.settings.impostorCount,
                selectedCategories: parsedCats,
                showHints: savedHints !== null ? savedHints === 'true' : room.settings.showHints
            };
        }
        return room.settings;
    });

    // Sync local settings state when room updates
    if (JSON.stringify(settings) !== JSON.stringify(room.settings) && !isHost) {
        setSettings(room.settings);
    }

    const handleSettingChange = (newSettings) => {
        setSettings(newSettings);
        if (isHost) {
            localStorage.setItem('impostor_online_impostorCount', newSettings.impostorCount);
            localStorage.setItem('impostor_online_categories', JSON.stringify(newSettings.selectedCategories));
            localStorage.setItem('impostor_online_showHints', newSettings.showHints);
        }
        socket.emit('update-settings', { roomCode: room.code, settings: newSettings });
    };

    const toggleCategory = (catId) => {
        if (!isHost) return;
        const currentCats = settings.selectedCategories;
        let newCats;
        if (currentCats.includes(catId)) {
            if (currentCats.length === 1) return;
            newCats = currentCats.filter(id => id !== catId);
        } else {
            newCats = [...currentCats, catId];
        }
        handleSettingChange({ ...settings, selectedCategories: newCats });
    };

    const handleStart = () => {
        if (!isHost) return;

        if (settings.selectedCategories.length === 0) {
            alert('Selecciona al menos una categoría');
            return;
        }

        const randomCatId = settings.selectedCategories[Math.floor(Math.random() * settings.selectedCategories.length)];
        const category = categories.find(c => c.id === randomCatId);

        if (!category) {
            alert('Error: Categoría no encontrada');
            return;
        }

        const players = [...room.players];

        if (isWhoIsWho) {
            // Who is Who Logic (Headbands)
            const availableWords = [...category.words];
            // Shuffle words
            for (let i = availableWords.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availableWords[i], availableWords[j]] = [availableWords[j], availableWords[i]];
            }

            // Assign one character per player
            const commonData = players.map((p, index) => ({
                id: p.id,
                name: p.name,
                character: availableWords[index % availableWords.length].word
            }));

            // Payload: Each player gets the FULL list
            const gameData = players.map(p => ({
                id: p.id,
                playersData: commonData
            }));

            socket.emit('start-game', { roomCode: room.code, gameData });

        } else {
            // Impostor Logic
            const wordObj = category.words[Math.floor(Math.random() * category.words.length)];

            const gameData = players.map(p => ({
                id: p.id,
                name: p.name,
                type: 'civilian',
                word: wordObj.word,
                hint: null
            }));

            let impostorsAssigned = 0;
            // Safety check to avoid infinite loop if impostorCount >= players
            const actualImpostorCount = Math.min(settings.impostorCount, players.length - 1);

            while (impostorsAssigned < actualImpostorCount) {
                const idx = Math.floor(Math.random() * players.length);
                if (gameData[idx].type !== 'impostor') {
                    const randomHint = wordObj.hints[Math.floor(Math.random() * wordObj.hints.length)];
                    gameData[idx].type = 'impostor';
                    gameData[idx].hint = settings.showHints ? randomHint : null;
                    impostorsAssigned++;
                }
            }

            socket.emit('start-game', { roomCode: room.code, gameData });
        }
    };

    return (
        <div className="card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Sala: {room.code}</h2>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem' }}>
                    {room.players.length} Jugadores
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Jugadores</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {room.players.map(p => (
                        <div key={p.id} style={{
                            padding: '0.5rem 1rem',
                            background: p.isHost ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            {p.isHost && <span>👑</span>}
                            {p.name} {p.id === socket.id && '(Tú)'}
                        </div>
                    ))}
                </div>
            </div>

            {isHost ? (
                <>
                    {!isWhoIsWho && (
                        <div className="input-group">
                            <label style={{ textAlign: 'left' }}>Impostores</label>
                            <input
                                type="number"
                                min="1"
                                max={Math.max(1, room.players.length - 1)}
                                value={settings.impostorCount}
                                onChange={(e) => handleSettingChange({ ...settings, impostorCount: parseInt(e.target.value) })}
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label style={{ textAlign: 'left' }}>Categorías</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => toggleCategory(cat.id)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.875rem',
                                        background: settings.selectedCategories.includes(cat.id) ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: '1px solid',
                                        borderColor: settings.selectedCategories.includes(cat.id) ? 'var(--accent-color)' : 'rgba(255,255,255,0.2)',
                                    }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {!isWhoIsWho && (
                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ marginTop: '0.75rem' }}>Pistas</label>
                            <div
                                onClick={() => handleSettingChange({ ...settings, showHints: !settings.showHints })}
                                style={{
                                    width: '3rem',
                                    height: '1.75rem',
                                    background: settings.showHints ? 'var(--accent-color)' : 'rgba(255,255,255,0.2)',
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
                                    left: settings.showHints ? '1.5rem' : '0.25rem',
                                    transition: 'left 0.2s'
                                }} />
                            </div>
                        </div>
                    )}

                    <button
                        className="btn-primary"
                        onClick={handleStart}
                        disabled={room.players.length < (isWhoIsWho ? 2 : 3) || (!isWhoIsWho && settings.impostorCount >= room.players.length)}
                        style={{ opacity: (room.players.length < (isWhoIsWho ? 2 : 3) || (!isWhoIsWho && settings.impostorCount >= room.players.length)) ? 0.5 : 1 }}
                    >
                        {room.players.length < (isWhoIsWho ? 2 : 3) ? 'Esperando jugadores...' : 'Iniciar juego'}
                    </button>
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem' }}>
                    <p>Esperando a que el anfitrión inicie la partida...</p>
                    <div style={{ marginTop: '1rem', fontSize: '0.875rem', opacity: 0.7 }}>
                        Configuración: {isWhoIsWho ? '¿Quién es Quién?' : `${settings.impostorCount} Impostor(es)`}, {settings.selectedCategories.length} Categorías
                    </div>
                </div>
            )}

            <button
                onClick={onLeave}
                style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    marginTop: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                }}
            >
                Salir de la Sala
            </button>
        </div>
    );
}
