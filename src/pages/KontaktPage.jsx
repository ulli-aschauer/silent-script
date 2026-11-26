import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

// Eigene Unterseite für das Kontaktformular
const KontaktPage = () => {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); document.title = 'Kontakt — Silent Script'; return () => { document.title = 'Silent Script — Wissenschaftliches Ghostwriting'; }; }, []);
  return (
    <div className="bg-[#F7F3ED] min-h-screen">
      <Navbar />
      <div className="pt-20">
        <Contact />
      </div>
      <Footer />
    </div>
  );
};

export default KontaktPage;
