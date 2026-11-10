import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import navigation from '../../data/navigation.json';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Link className="brand-mark" to="/" onClick={close} aria-label="Dahoun Manel home">
          <span className="brand-monogram">DM</span>
          <span className="brand-name">DAHOUN MANEL<span>PORTFOLIO / 2026</span></span>
        </Link>
        <button className="mobile-menu-toggle" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Main navigation">
          {navigation.map((item) => (
            <a key={item.label} href={isHome ? item.href : `/${item.href}`} onClick={close}>{item.label}</a>
          ))}
          <Link className="nav-cv-link" to="/cvs" onClick={close}>CV library <ArrowUpRight size={14} /></Link>
        </nav>
      </div>
    </header>
  );
}
