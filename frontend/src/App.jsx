import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import CreditsPage from './pages/CreditsPage';
import CustomerDetailPage from './pages/CustomerDetailPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="credits" element={<CreditsPage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
