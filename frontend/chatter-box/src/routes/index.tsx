import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import ProtectedRoute from '../components/ProtectedRoute';
import Chat from '../pages/Chat';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/chat" element={<Chat />} />
            </Route>
        </Routes>
    )
}