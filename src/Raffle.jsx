import { useState } from 'react';

const PRICE_PER_TICKET = 1000; // ARS, ajustar según convenga

export default function Raffle() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleBuy(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
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
        setError(data.error || 'No se pudo crear la preferencia.');
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="raffle-section" style={{marginTop: 40}}>
      <div className="section-heading">
        <p className="eyebrow">Sorteo solidario</p>
        <h2>Compra boletos y ayuda a quienes lo necesitan</h2>
      </div>

      <div className="product-card" style={{maxWidth: 720}}>
        <form onSubmit={handleBuy} style={{display: 'grid', gap: 12}}>
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
            <select value={quantity} onChange={(e) => setQuantity(e.target.value)}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} — ${n * PRICE_PER_TICKET} ARS</option>
              ))}
            </select>
          </label>

          <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Redirigiendo...' : `Pagar ${quantity * PRICE_PER_TICKET} ARS`}
            </button>
            <button type="button" className="secondary-btn" onClick={() => { setQuantity(1); setName(''); setEmail(''); }}>
              Limpiar
            </button>
          </div>

          {error && <div style={{color: 'crimson'}}>{error}</div>}

          <p style={{fontSize: '0.9rem', color: '#544139'}}>
            Las transacciones se procesan con Mercado Pago. No almacenamos datos de pago en este sitio; el cobro se realiza en la pasarela segura de Mercado Pago.
          </p>
        </form>
      </div>
    </section>
  );
}
