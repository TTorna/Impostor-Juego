import { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import OnlineManager from './components/OnlineManager';

function App() {
  const [gameConfig, setGameConfig] = useState(null);
  const [mode, setMode] = useState(null); // null (menu), 'local', 'online'

  if (mode === 'online') {
    return (
      <div className="animate-fade-in">
        <h1 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '2rem', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Impostor
        </h1>
        <OnlineManager onBack={() => setMode(null)} />
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in">
        <h1 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '2rem', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Impostor
        </h1>

        {!mode ? (
          <div className="card animate-fade-in" style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '2rem' }}>Selecciona un modo</h2>
            <button
              className="btn-primary"
              onClick={() => setMode('local')}
              style={{ marginBottom: '1rem' }}
            >
              Modo Local (Un&nbsp;dispositivo)
            </button>
            <button
              className="btn-primary"
              onClick={() => setMode('online')}
              style={{ background: 'var(--secondary-gradient)' }}
            >
              Modo Online (Multijugador)
            </button>
          </div>
        ) : !gameConfig ? (
          <>
            <SetupScreen onStartGame={setGameConfig} />
            <button
              onClick={() => setMode(null)}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'transparent',
                color: 'var(--text-secondary)',
                marginTop: '1rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Volver al Menú
            </button>
          </>
        ) : (
          <GameScreen
            config={gameConfig}
            onEndGame={() => setGameConfig(null)}
          />
        )}
      </div>
      {!mode ? (
        <footer style={{ textAlign: 'center', bottom: '0', left: '0', right: '0', position: 'fixed', width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.5)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>© 2025. hecho por @tomi_torna ⚡</p>
        </footer>
      ) : null}
    </>
  );
}

export default App;
