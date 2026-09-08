import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/fraunces/standard-italic.css';
import '../styles.css';
import EditorApp from './EditorApp';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><EditorApp/></React.StrictMode>);
