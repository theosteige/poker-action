import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing, PokerClock, PokerBank } from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/poker-clock" element={<PokerClock />} />
        <Route path="/poker-bank" element={<PokerBank />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
