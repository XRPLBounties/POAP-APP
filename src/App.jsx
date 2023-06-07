import 'semantic-ui-css/semantic.min.css';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Login from './components/login/login.jsx';
import { Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import styles from './App.css?inline';

function App() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Router>
                <div className={styles.app}>
                    <ToastContainer />
                    <Routes>
                        <Route path="/" element={<Login />} />
                    </Routes>
                </div>
            </Router>
        </Suspense>
    );
}

export default App;
