const menuItems = ['Inicio', 'Productos', 'Especiales', 'Contacto'];

const products = [
  { name: 'Carne de res', description: 'Corte premium para asados', price: '$24.90/kg' },
  { name: 'Pollo', description: 'Fresco y jugoso', price: '$11.50/kg' },
  { name: 'Cerdo', description: 'Ideal para parrilla', price: '$18.70/kg' },
  { name: 'Chorizo', description: 'Sabor casero', price: '$16.00/kg' },
];

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">C</div>
          <div>
            <p className="brand-name">Carnicería la Tablita</p>
            <span className="brand-tag">Calidad desde 1998</span>
          </div>
        </div>

        <nav className="nav" aria-label="Navegación principal">
          {menuItems.map((item) => (
            <a key={item} href="#" className="nav-link">
              {item}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Carnes frescas</p>
            <h1>La calidad que tu mesa merece.</h1>
            <p>
              Ofrecemos cortes selectos, atención personalizada y productos siempre frescos para tus
              mejores comidas en familia.
            </p>
            <div className="cta-row">
              <button className="primary-btn">Ver catálogo</button>
              <button className="secondary-btn">Contactar</button>
            </div>
          </div>

          <div className="hero-card">
            <p className="mini-label">Hoy destacamos</p>
            <h2>Combo familiar</h2>
            <ul>
              <li>Res premium</li>
              <li>Pollo entero</li>
              <li>Chorizo artesanal</li>
            </ul>
            <span className="price">$89.90</span>
          </div>
        </section>

        <section className="products-section">
          <div className="section-heading">
            <p className="eyebrow">Productos</p>
            <h2>Nuestros favoritos</h2>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <article key={product.name} className="product-card">
                <div className="product-icon">🥩</div>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <strong>{product.price}</strong>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
