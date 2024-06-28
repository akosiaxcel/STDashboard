import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './Dashboard'; // Ensure the path and name are correct

// Assuming your root element is with id 'root'
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Dashboard />);
