import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { TripPage } from '@/pages/TripPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trip/:tripId" element={<TripPage />} />
          {/* Catch-all route for 404 */}
          <Route path="*" element={
            <div className="page-container">
              <h1 className="text-2xl font-bold">Page Not Found</h1>
              <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
