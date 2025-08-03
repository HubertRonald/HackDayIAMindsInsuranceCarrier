import { useState, useEffect } from 'react';
import { Briefcase } from 'react-feather';
import '../App.css';

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`app-header inverted-header ${scrolled ? 'header-small' : ''}`}>
      <div className="header-content">
        <Briefcase size={28} className="header-icon" />
        <h1>Insurance Carrier</h1>
      </div>
    </header>
  );
}

export default Header;
