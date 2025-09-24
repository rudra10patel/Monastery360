import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// CSS is built separately via PostCSS/Tailwind and linked in index.html

createRoot(document.getElementById("root")!).render(<App />);
