import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Generate from './pages/Generate';
import History from './pages/History';
import Visualization from './pages/Visualization';
import Login from './pages/login';     // 👈 import Login page
import Signup from './pages/signup';   // 👈 import Signup page

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/history" element={<History />} />
          <Route path="/visualization" element={<Visualization />} />
          <Route path="/login" element={<Login />} />      {/* 👈 add route */}
          <Route path="/signup" element={<Signup />} />    {/* 👈 add route */}
          <Route path="/visualization/:id" element={<Visualization />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
