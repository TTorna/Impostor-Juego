import { useState } from 'react';

export default function Card({ content, type, hint, isRevealed, onReveal, onNext }) {
    // We use the parent's isRevealed state to control the flip

    return (
        <div style={{ perspective: '1000px', width: '100%', maxWidth: '300px', height: '400px', margin: '0 auto' }}>
            <div
                onClick={!isRevealed ? onReveal : null}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transition: 'transform 0.8s',
                    transformStyle: 'preserve-3d',
                    cursor: !isRevealed ? 'pointer' : 'default',
                    transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
            >
                {/* Front of Card */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    background: 'var(--card-bg)',
                    borderRadius: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-lg)',
                    border: '2px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❓</div>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>Toca para revelar</h3>
                </div>

                {/* Back of Card */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    background: type === 'impostor' ? 'var(--danger-gradient)' : 'var(--secondary-gradient)',
                    borderRadius: '1.5rem',
                    transform: 'rotateY(180deg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    boxShadow: 'var(--shadow-lg)',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    {type === 'impostor' ? (
                        <>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤫</div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>IMPOSTOR</h2>
                            {hint && (
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '1rem', marginTop: '1rem' }}>
                                    <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Pista:</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{hint}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{content}</h2>
                            <p style={{ opacity: 0.8 }}>Memoriza la palabra</p>
                        </>
                    )}

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onNext();
                        }}
                        style={{
                            marginTop: 'auto',
                            background: 'white',
                            color: type === 'impostor' ? '#ef4444' : '#3b82f6',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.75rem',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        Siguiente Jugador
                    </button>
                </div>
            </div>
        </div>
    );
}
