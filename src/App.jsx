import { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';

function App() {
  const [gameConfig, setGameConfig] = useState(null);

  return (
    <div className="animate-fade-in">
      <h1 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '2rem', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Impostor
      </h1>

      {!gameConfig ? (
        <SetupScreen onStartGame={setGameConfig} />
      ) : (
        <GameScreen
          config={gameConfig}
          onEndGame={() => setGameConfig(null)}
        />
      )}
    </div>
  );
}

export default App;
