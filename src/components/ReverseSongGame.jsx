import { useState, useRef, useEffect } from 'react';

/**
 * ReverseSongGame Component
 * 
 * Game Flow:
 * 1. Player 1 records a song snippet.
 * 2. The audio is reversed.
 * 3. Player 2 listens to the reversed audio and tries to memorize it.
 * 4. Player 2 records themselves imitating the reversed audio.
 * 5. The imitation is reversed back (revealing the original melody).
 * 6. Both players listen to the results.
 */
export default function ReverseSongGame({ onBack }) {
    // Game Phases: 'setup' -> 'record-original' -> 'listen-reversed' -> 'record-imitation' -> 'result'
    const [phase, setPhase] = useState('setup');

    // UI States
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Audio Context
    const [audioContext, setAudioContext] = useState(null);

    // Audio Data Storage (Buffers)
    const originalBufferRef = useRef(null);           // Player 1's original recording
    const reversedOriginalBufferRef = useRef(null);   // Player 1's recording reversed
    const imitationBufferRef = useRef(null);          // Player 2's imitation recording
    const reversedImitationBufferRef = useRef(null);  // Player 2's imitation reversed

    // Media Recorder Refs
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    // Initialize AudioContext on component mount
    useEffect(() => {
        const initAudio = () => {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContextClass();
            setAudioContext(ctx);
        };
        initAudio();

        return () => {
            // Cleanup: Close context if component unmounts
            if (audioContext && audioContext.state !== 'closed') {
                audioContext.close();
            }
        };
    }, []);

    /**
     * Starts recording audio from the microphone.
     */
    const startRecording = async () => {
        if (!audioContext) return;

        // Ensure AudioContext is running (browsers sometimes suspend it)
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            // Collect audio data chunks
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            // Process audio when recording stops
            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const arrayBuffer = await blob.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                handleRecordingComplete(audioBuffer);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Error: No se pudo acceder al micrófono. Por favor verifica los permisos.");
        }
    };

    /**
     * Stops the current recording.
     */
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Stop all tracks to release the microphone
            if (mediaRecorderRef.current.stream) {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
        }
    };

    /**
     * Handles the processed audio buffer after recording.
     * Reverses the audio and advances the game phase.
     */
    const handleRecordingComplete = (buffer) => {
        const reversed = reverseBuffer(buffer);

        if (phase === 'record-original') {
            originalBufferRef.current = buffer;
            reversedOriginalBufferRef.current = reversed;
            setPhase('listen-reversed');
        } else if (phase === 'record-imitation') {
            imitationBufferRef.current = buffer;
            reversedImitationBufferRef.current = reversed;
            setPhase('result');
        }
    };

    /**
     * Creates a reversed copy of the given AudioBuffer.
     */
    const reverseBuffer = (buffer) => {
        const numberOfChannels = buffer.numberOfChannels;
        const reversedBuffer = audioContext.createBuffer(
            numberOfChannels,
            buffer.length,
            buffer.sampleRate
        );

        for (let i = 0; i < numberOfChannels; i++) {
            const inputData = buffer.getChannelData(i);
            const outputData = reversedBuffer.getChannelData(i);

            // Copy data in reverse order
            for (let j = 0; j < buffer.length; j++) {
                outputData[j] = inputData[buffer.length - 1 - j];
            }
        }
        return reversedBuffer;
    };

    /**
     * Plays the given AudioBuffer.
     */
    const playAudio = (buffer) => {
        if (!buffer || !audioContext) return;

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);

        source.onended = () => setIsPlaying(false);

        source.start();
        setIsPlaying(true);
    };

    // --- RENDER HELPERS ---

    const renderSetup = () => (
        <div className="card animate-fade-in" style={{ textAlign: 'center' }}>
            <h2 style={{
                fontSize: '2.5rem',
                marginBottom: '1rem',
                background: 'var(--primary-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                Desafío Invertido
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2rem' }}>
                ¡El juego de imitación musical!
            </p>
            <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '1.5rem',
                borderRadius: '1rem',
                textAlign: 'left',
                marginBottom: '2rem',
                lineHeight: '1.6'
            }}>
                <p>1. 🎤 <strong>Jugador 1</strong> graba un pedacito de canción.</p>
                <p>2. 🔄 La App lo da vuelta automáticamente.</p>
                <p>3. 👂 <strong>Jugador 2</strong> escucha el audio invertido e intenta imitarlo.</p>
                <p>4. ✨ La App da vuelta la imitación para ver si suena como la original.</p>
            </div>
            <button
                className="btn-primary"
                onClick={() => setPhase('record-original')}
                style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
            >
                Comenzar
            </button>
        </div>
    );

    const renderRecordingUI = (player, instruction) => (
        <div className="card animate-fade-in" style={{ textAlign: 'center' }}>
            <h3 style={{
                fontSize: '2rem',
                marginBottom: '1rem',
                color: player === 'Jugador 1' ? '#facc15' : '#4ade80'
            }}>
                {player}
            </h3>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{instruction}</p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <button
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        background: isRecording ? 'var(--danger-gradient)' : 'var(--secondary-gradient)',
                        border: 'none',
                        fontSize: '3rem',
                        color: 'white',
                        boxShadow: isRecording ? '0 0 30px rgba(239, 68, 68, 0.6)' : 'var(--shadow-lg)',
                        transform: isRecording ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        touchAction: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    {isRecording ? '⏹️' : '🎤'}
                </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {isRecording ? 'Soltá para terminar' : 'Mantené apretado para grabar'}
            </p>
        </div>
    );

    const renderListenReversed = () => (
        <div className="card animate-fade-in" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#4ade80' }}>Jugador 2</h3>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Escucha el audio invertido e intenta memorizarlo.</p>

            <button
                className="btn-primary"
                onClick={() => playAudio(reversedOriginalBufferRef.current)}
                disabled={isPlaying}
                style={{
                    background: 'var(--secondary-gradient)',
                    marginBottom: '2rem',
                    opacity: isPlaying ? 0.7 : 1
                }}
            >
                {isPlaying ? '🔊 Reproduciendo...' : '▶️ Escuchar Invertido'}
            </button>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>¿Listo para imitarlo?</p>
                <button
                    className="btn-primary"
                    onClick={() => setPhase('record-imitation')}
                >
                    Ir a Grabar Imitación
                </button>
            </div>
        </div>
    );

    const renderResult = () => (
        <div className="card animate-fade-in" style={{ textAlign: 'center' }}>
            <h3 style={{
                fontSize: '2.5rem',
                marginBottom: '1.5rem',
                background: 'linear-gradient(to right, #facc15, #fb923c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                ¡Resultado Final!
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Original */}
                <div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Original (Jugador 1)</p>
                    <button
                        className="btn-primary"
                        onClick={() => playAudio(originalBufferRef.current)}
                        disabled={isPlaying}
                        style={{ background: 'rgba(255,255,255,0.1)', fontSize: '1rem', padding: '0.75rem' }}
                    >
                        ▶️ Escuchar Original
                    </button>
                </div>

                {/* Imitation */}
                <div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Imitación (Jugador 2)</p>
                    <button
                        className="btn-primary"
                        onClick={() => playAudio(imitationBufferRef.current)}
                        disabled={isPlaying}
                        style={{ background: 'rgba(255,255,255,0.1)', fontSize: '1rem', padding: '0.75rem' }}
                    >
                        ▶️ Escuchar Imitación (Rara)
                    </button>
                </div>

                {/* The Reveal */}
                <div style={{
                    marginTop: '1rem',
                    padding: '1.5rem',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#facc15', marginBottom: '0.5rem' }}>✨ La Revelación ✨</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>(Imitación dada vuelta)</p>
                    <button
                        className="btn-primary"
                        onClick={() => playAudio(reversedImitationBufferRef.current)}
                        disabled={isPlaying}
                        style={{ fontSize: '1.2rem', padding: '1rem' }}
                    >
                        🪄 Escuchar Magia
                    </button>
                </div>
            </div>

            <button
                onClick={() => {
                    // Reset Game
                    originalBufferRef.current = null;
                    reversedOriginalBufferRef.current = null;
                    imitationBufferRef.current = null;
                    reversedImitationBufferRef.current = null;
                    setPhase('setup');
                }}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    textDecoration: 'underline',
                    marginTop: '2rem',
                    cursor: 'pointer'
                }}
            >
                Jugar de nuevo
            </button>
        </div>
    );

    return (
        <div className="w-full max-w-md mx-auto p-4">
            <button
                onClick={onBack}
                className="mb-2rem text-gray-700 hover:text-white flex items-center gap-2 transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}
            >
                ← Volver al Menú
            </button>

            {phase === 'setup' && renderSetup()}
            {phase === 'record-original' && renderRecordingUI('Jugador 1', 'Graba un pedacito de una canción (5-10 seg)')}
            {phase === 'listen-reversed' && renderListenReversed()}
            {phase === 'record-imitation' && renderRecordingUI('Jugador 2', '¡Graba tu imitación de los sonidos raros!')}
            {phase === 'result' && renderResult()}
        </div>
    );
}
