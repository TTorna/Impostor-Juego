import { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import OnlineManager from './components/OnlineManager';

function App() {
  const [game, setGame] = useState(null); // null (main menu), 'impostor', 'whoiswho'
  const [gameConfig, setGameConfig] = useState(null);
  const [mode, setMode] = useState(null); // null (menu), 'local', 'online'

  // Reset everything when going back to main game selection
  const handleBackToMain = () => {
    setGame(null);
    setMode(null);
    setGameConfig(null);
  };

  if (!game) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{
          textAlign: 'center',
          fontSize: '4rem',
          marginBottom: '3rem',
          background: 'var(--primary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '800',
          letterSpacing: '-0.05em'
        }}>
          Juegos
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          padding: '1rem'
        }}>
          {/* Impostor Card */}
          <div
            onClick={() => setGame('impostor')}
            className="card animate-fade-in"
            style={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '2rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.5)';
              e.currentTarget.style.borderColor = 'var(--accent-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🕵️</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Impostor</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Descubre al espía entre nosotros antes de que sea tarde.
            </p>
          </div>

          {/* Who is Who Card */}
          <div
            onClick={() => {
              setGame('whoiswho');
              setMode('online');
            }}
            className="card animate-fade-in"
            style={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '2rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.5)';
              e.currentTarget.style.borderColor = 'var(--accent-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❓</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>¿Quién es Quién?</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Adivina el personaje secreto de tu rival haciendo preguntas.
            </p>
          </div>
        </div>

        <footer style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem', color: 'var(--text-secondary)' }}>
          <p>© 2025. hecho por @tomi_torna ⚡</p>
        </footer>
      </div>
    );
  }

  if (mode === 'online') {
    return (
      <div className="animate-fade-in">
        <h1 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '2rem', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {game === 'impostor' ? 'Impostor' : '¿Quién es Quién?'}
        </h1>
        <OnlineManager gameType={game} onBack={handleBackToMain} />
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
            <button
              onClick={handleBackToMain}
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
              Volver
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
