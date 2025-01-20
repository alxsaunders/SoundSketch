import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, Info } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo on left */}
        <Link to="/" className="navbar-logo">
          LOGO
        </Link>

        {/* Icons on right */}
        <div className="navbar-icons">
          <Link to="/profile" className="navbar-icon">
            <UserCircle size={32} />
          </Link>
          <Link to="/info" className="navbar-icon">
            <Info size={32} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;