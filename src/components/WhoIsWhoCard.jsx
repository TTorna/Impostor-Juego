import { useState } from 'react';

export default function WhoIsWhoCard({ content, eliminated, onToggle }) {
    const isHidden = content === '???';

    return (
        <div
            onClick={onToggle}
            style={{
                width: '160px',
                height: '220px',
                perspective: '1000px',
                cursor: 'pointer',
                opacity: eliminated ? 0.6 : 1,
                transform: eliminated ? 'scale(0.95)' : 'scale(1)',
                transition: 'transform 0.3s'
            }}
        >
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                textAlign: 'center',
                transition: 'transform 0.8s',
                transformStyle: 'preserve-3d',
                transform: isHidden ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}>
                {/* FRONT (Character) */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    background: 'white',
                    color: '#333',
                    borderRadius: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    border: eliminated ? '2px solid #555' : 'none'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem', filter: eliminated ? 'grayscale(100%)' : 'none' }}>
                        👤
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', wordBreak: 'break-word', lineHeight: '1.2' }}>
                        {content}
                    </div>
                </div>

                {/* BACK (Hidden) */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    background: 'var(--secondary-gradient)',
                    color: 'white',
                    borderRadius: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'rotateY(180deg)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                    border: '2px solid rgba(255,255,255,0.2)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                        ❓
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        ?
                    </div>
                </div>
            </div>

            {eliminated && (
                <div style={{
                    position: 'absolute',
                    top: '0', left: '0', right: '0', bottom: '0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '4rem', color: 'red', fontWeight: 'bold',
                    pointerEvents: 'none',
                    zIndex: 10
                }}>
                    ✕
                </div>
            )}
        </div>
    );
}
