import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/subscription.css';

const savedTheme=localStorage.getItem('streamify.theme')||'dark';
document.documentElement.dataset.theme=savedTheme;
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
