import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ScrollRestoration } from './components/ScrollRestoration';
import SpaceBackground from './components/SpaceBackground';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import DetailPage from './pages/DetailPage';
import CVLibrary from './pages/CVLibrary';
import CollectionPage from './pages/CollectionPage';
import NotFound from './pages/NotFound';
import { PortfolioDataProvider } from './context/PortfolioDataContext';

function PublicLayout() {
  return (
    <>
      <SpaceBackground />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cvs" element={<CVLibrary />} />
        <Route path="/collections/:collection" element={<CollectionPage />} />
        <Route path="/:collection/:slug" element={<DetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PortfolioDataProvider>
        <ScrollRestoration />
        <PublicLayout />
      </PortfolioDataProvider>
    </BrowserRouter>
  );
}
