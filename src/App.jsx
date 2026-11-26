import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Stats from './components/Stats';
import Services from './components/Services';
import Fields from './components/Fields';
import QuoteRequest from './components/QuoteRequest';
import CtaBanner from './components/CtaBanner';
import Process from './components/Process';
import Footer from './components/Footer';
import AdminPage from './pages/AdminPage';
import AutorenPage from './pages/AutorenPage';
import KontaktPage from './pages/KontaktPage';
import BestaetigungPage from './pages/BestaetigungPage';

const Home = () => {
  const [prefill, setPrefill] = React.useState('');
  const { hash } = useLocation();
  // Von Unterseiten kommend (z.B. /#about): zum Abschnitt scrollen
  React.useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ block: 'start', behavior: 'instant' }), 50);
    return () => clearTimeout(t);
  }, [hash]);
  return (
    <div className="bg-[#F7F3ED] min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Stats />
      <Services />
      <Fields onPick={setPrefill} />
      <QuoteRequest prefill={prefill} />
      <Process />
      <CtaBanner />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/autoren" element={<AutorenPage />} />
          <Route path="/kontakt" element={<KontaktPage />} />
          <Route path="/bestaetigung/:token" element={<BestaetigungPage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
