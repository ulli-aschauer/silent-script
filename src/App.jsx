import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPage from './pages/AdminPage';
import AutorenPage from './pages/AutorenPage';

const Home = () => {
  const [prefill, setPrefill] = React.useState('');
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
      <Contact />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/autoren" element={<AutorenPage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
