import { useState, useEffect } from 'react';

const PRICE_PER_TICKET = 1000; // ARS

export default function Lottery() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [entries, setEntries] = useState([]);
  const [showEntries, setShowEntries] = useState(false);
  const [spinAnimation, setSpinAnimation] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState(null);

  const DEMO = (import.meta.env.VITE_RAFFLE_DEMO === 'true') || window.location.search.includes('demo=true');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lottery_entries');
      setEntries(raw ? JSON.parse(raw) : []);
    } catch (e) {
      setEntries([]);
    }
  }, []);

  function saveEntry(entry) {
    const next = [entry, ...entries].slice(0, 200);
    setEntries(next);
    try {
      localStorage.setItem('lottery_entries', JSON.stringify(next));
    } catch (e) {
      // ignore storage errors
    }
  }

  function pickWinner() {
    if (entries.length === 0) {
      setError('No hay participantes aún.');
      return;
    }

    setSpinAnimation(true);
    
    // Simulate spinning animation
    setTimeout(() => {
      const winner = entries[Math.floor(Math.random() * entries.length)];
      setSelectedWinner(winner);
      setSpinAnimation(false);
    }, 2000);
  }

  async function handleBuy(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name || !email) {
      setError('Por favor completa nombre y email.');
      setLoading(false);
      return;
    }

    try {
      if (DEMO) {
        await new Promise((r) => setTimeout(r, 700));
        const ticketIds = Array.from(
          { length: quantity },
          () => `LOTO-${Math.random().toString(36).slice(2, 9).toUpperCase()}`
        );
        const entry = {
          name,
          email,
          phone,
          quantity,
          ticketIds,
          created_at: new Date().toISOString(),
          demo: true,
        };
        saveEntry(entry);
        setSuccess({ message: 'Compra simulada (modo demo). ¡Buena suerte!', entry });
        setName('');
        setEmail('');
        setPhone('');
        setQuantity(1);
      } else {
        const res = await fetch('/.netlify/functions/create_preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payer: { name, email },
            quantity: Number(quantity),
            unit_price: Number(PRICE_PER_TICKET),
          }),
        });
        const data = await res.json();
        if (res.ok && data.init_point) {
          window.location.href = data.init_point;
        } else {
          const msg = (data && (data.error && (data.error.message || JSON.stringify(data.error)))) || data?.error || 'No se pudo crear la preferencia.';
          setError(msg);
        }
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="lottery-section" style={{ marginTop: 60, marginBottom: 60 }}>
      <div className="section-heading">
        <p className="eyebrow">🎰 Lotería</p>
        <h2>¡Gana premios increíbles!</h2>
        <p style={{ color: '#6b4d3f', marginTop: 10 }}>Compra boletos para participar en nuestro sorteo. 100% de los fondos van a obras de caridad.</p>
      </div>

      <div className="lottery-container">
        {/* Ticket Purchase Section */}
        {!success ? (
          <div className="product-card lottery-card">
            <form onSubmit={handleBuy} style={{ display: 'grid', gap: 16 }}>
              <h3 style={{ marginTop: 0, color: '#1f120c' }}>Compra tu boleto</h3>

              <label className="lottery-label">
                <span>Nombre completo</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                />
              </label>

              <label className="lottery-label">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </label>

              <label className="lottery-label">
                <span>Teléfono (opcional)</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+54 9 XXX XXXXXXX"
                />
              </label>

              <label className="lottery-label">
                <span>Cantidad de boletos</span>
                <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} boleto{n > 1 ? 's' : ''} — ${n * PRICE_PER_TICKET} ARS
                    </option>
                  ))}
                </select>
              </label>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="primary-btn lottery-btn" type="submit" disabled={loading}>
                  {loading ? 'Procesando...' : `${DEMO ? 'Simular ' : 'Comprar '} ${quantity * PRICE_PER_TICKET} ARS`}
                </button>
                <button
                  type="button"
                  className="secondary-btn lottery-btn"
                  onClick={() => {
                    setQuantity(1);
                    setName('');
                    setEmail('');
                    setPhone('');
                  }}
                >
                  Limpiar
                </button>
              </div>

              {error && <div className="error-message">❌ {error}</div>}

              <p style={{ fontSize: '0.85rem', color: '#8f5332', marginTop: 8 }}>
                {DEMO
                  ? 'ℹ️ Modo demo: Los datos se guardan localmente. No se procesa pago real.'
                  : '🔒 Transacciones seguras con Mercado Pago. No almacenamos datos de tarjeta.'}
              </p>
            </form>
          </div>
        ) : (
          <div className="product-card lottery-card lottery-success">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
              <h3 style={{ color: '#b74b2a', marginBottom: 10 }}>¡Bienvenido a la lotería!</h3>
              <p style={{ fontSize: '1.1rem', marginBottom: 20 }}>{success.message}</p>

              {success.entry && (
                <div className="ticket-box">
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>{success.entry.name}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#8f5332' }}>{success.entry.email}</p>
                    {success.entry.phone && (
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#8f5332' }}>{success.entry.phone}</p>
                    )}
                  </div>

                  <div style={{ borderTop: '2px dashed #d4a574', paddingTop: 12, marginTop: 12 }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      Boletos ({success.entry.quantity})
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                      {success.entry.ticketIds.map((t) => (
                        <div key={t} className="ticket-number">
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="secondary-btn lottery-btn" onClick={() => setShowEntries((s) => !s)}>
                  {showEntries ? 'Ocultar participantes' : `Ver participantes (${entries.length})`}
                </button>
                <button className="primary-btn lottery-btn" onClick={() => setSuccess(null)}>
                  Comprar otro boleto
                </button>
              </div>

              {entries.length > 1 && (
                <button className="lottery-winner-btn" onClick={pickWinner} disabled={spinAnimation}>
                  {spinAnimation ? '🎰 Sorteando...' : '🎰 Elegir ganador'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Participants List */}
        {showEntries && entries.length > 0 && (
          <div className="product-card lottery-card lottery-entries">
            <h4 style={{ marginTop: 0, color: '#1f120c' }}>Participantes ({entries.length})</h4>
            <div className="entries-list">
              {entries.map((en, idx) => (
                <div key={idx} className="entry-item">
                  <div>
                    <strong>{en.name}</strong>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#6b4d3f' }}>
                      {en.email}{en.phone && ` • ${en.phone}`}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#b74b2a' }}>{en.quantity} boleto{en.quantity > 1 ? 's' : ''}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#8f5332' }}>
                      {new Date(en.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Winner Announcement */}
        {selectedWinner && (
          <div className="product-card lottery-card lottery-winner">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🏆</div>
              <h3 style={{ color: '#812f1f', marginBottom: 8 }}>¡GANADOR!</h3>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1f120c', margin: '12px 0' }}>
                {selectedWinner.name}
              </p>
              <p style={{ margin: '8px 0', fontSize: '1rem', color: '#6b4d3f' }}>
                {selectedWinner.email}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#8f5332', marginBottom: 20 }}>
                Boleto ganador: <strong style={{ color: '#b74b2a' }}>{selectedWinner.ticketIds[0]}</strong>
              </p>
              <button className="primary-btn lottery-btn" onClick={() => setSelectedWinner(null)}>
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
