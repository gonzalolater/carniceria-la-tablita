import { useState, useEffect } from 'react';

const PRICE_PER_TICKET = 1000; // ARS, ajustar según convenga

export default function Raffle() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [entries, setEntries] = useState([]);
  const [showEntries, setShowEntries] = useState(false);

  const DEMO = (import.meta.env.VITE_RAFFLE_DEMO === 'true') || window.location.search.includes('demo=true');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('raffle_entries');
      setEntries(raw ? JSON.parse(raw) : []);
    } catch (e) {
      setEntries([]);
    }
  }, []);

  function saveEntry(entry) {
    const next = [entry, ...entries].slice(0, 200); // keep recent
    setEntries(next);
    try {
      localStorage.setItem('raffle_entries', JSON.stringify(next));
    } catch (e) {
      // ignore storage errors
    }
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
        // simulate purchase flow
        await new Promise((r) => setTimeout(r, 700));
        const ticketIds = Array.from({ length: quantity }, () => `DEMO-${Math.random().toString(36).slice(2, 9).toUpperCase()}`);
        const entry = { name, email, quantity, ticketIds, created_at: new Date().toISOString(), demo: true };
        saveEntry(entry);
        setSuccess({ message: 'Compra simulada (modo demo). Gracias por colaborar.', entry });
        setName('');
        setEmail('');
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
          // redirect to Mercado Pago checkout
          window.location.href = data.init_point;
        } else {
          const msg = (data && (data.error && (data.error.message || JSON.stringify(data.error))) ) || data?.error || 'No se pudo crear la preferencia.';
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
    <section className="raffle-section" style={{ marginTop: 40 }}>
      <div className="section-heading">
        <p className="eyebrow">Sorteo solidario</p>
        <h2>Compra boletos y ayuda a quienes lo necesitan</h2>
      </div>

      <div className="product-card" style={{ maxWidth: 720 }}>
        {success ? (
          <div>
            <h3 style={{ marginTop: 0 }}>¡Gracias!</h3>
            <p>{success.message}</p>
            {success.entry && (
              <div style={{ background: '#fffaf2', padding: 12, borderRadius: 8 }}>
                <strong>{success.entry.name}</strong> — {success.entry.quantity} boleto(s)
                <div style={{ marginTop: 8 }}>
                  <small>Boletos:</small>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                    {success.entry.ticketIds.map((t) => (
                      <span key={t} style={{ background: '#f2e9df', padding: '6px 8px', borderRadius: 6, fontWeight: 700 }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="secondary-btn" onClick={() => setShowEntries((s) => !s)}>
                {showEntries ? 'Ocultar participantes' : `Ver participantes (${entries.length})`}
              </button>
              <button className="primary-btn" onClick={() => setSuccess(null)}>
                Comprar otro boleto
              </button>
            </div>

            {showEntries && (
              <div style={{ marginTop: 12 }}>
                <h4>Participantes (local)</h4>
                <ul>
                  {entries.map((en, idx) => (
                    <li key={idx} style={{ marginBottom: 8 }}>
                      <strong>{en.name}</strong> ({en.email}) — {en.quantity} — {new Date(en.created_at).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleBuy} style={{ display: 'grid', gap: 12 }}>
            <label>
              Nombre completo
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            <label>
              Cantidad de boletos
              <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n} — ${n * PRICE_PER_TICKET} ARS</option>
                ))}
              </select>
            </label>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="primary-btn" type="submit" disabled={loading}>
                {loading ? (DEMO ? 'Simulando pago...' : 'Redirigiendo...') : `${DEMO ? 'Simular ' : 'Pagar '} ${quantity * PRICE_PER_TICKET} ARS`}
              </button>
              <button type="button" className="secondary-btn" onClick={() => { setQuantity(1); setName(''); setEmail(''); }}>
                Limpiar
              </button>
            </div>

            {error && <div style={{ color: 'crimson' }}>{error}</div>}

            <p style={{ fontSize: '0.9rem', color: '#544139' }}>
              {DEMO ? 'Modo demo activado: la compra se simulará y se guardará localmente (no se procesa pago).' : 'Las transacciones se procesan con Mercado Pago. No almacenamos datos de pago en este sitio; el cobro se realiza en la pasarela segura de Mercado Pago.'}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
