import 'semantic-ui-css/semantic.min.css';
import 'react-toastify/dist/ReactToastify.css';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Login from './components/login/login.jsx';
import OrganizerDashboard from './components/OrganizerDashboard/OrganizerDashboard.jsx';
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
                        <Route
                            path="/dashboard"
                            element={<OrganizerDashboard />}
                        />
                    </Routes>
                </div>
            </Router>
        </Suspense>
    );
}

export default App;
