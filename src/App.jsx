import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
          <Navbar />
          <div className="flex-1 flex flex-col">
            <AppRoutes />
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
