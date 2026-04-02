import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', background: 'var(--bg-color)', paddingTop: '80px' }}>
    <div style={{ fontSize: '6rem', fontWeight: '900', color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>404</div>
    <h2 style={{ fontSize: '1.5rem', color: '#334155' }}>This page doesn't exist</h2>
    <p style={{ color: '#64748b', maxWidth: '400px', textAlign: 'center' }}>The bouquet you're looking for may have been moved or never existed. Let's get you back.</p>
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Link to='/' className='btn-primary'>Go Home</Link>
      <Link to='/gallery' className='btn-secondary'>Browse Collection</Link>
    </div>
  </div>
);

export default NotFoundPage;