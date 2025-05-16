import React, { useState } from "react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/auth";
// import { AuthContext } from "../context/AuthContext";

export const Signup = () => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPass] = useState<string>('');
    // const auth = useContext(AuthContext)!;

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: call API
        console.log('signup', { username, email, password });
        try {
            const response = await signup({ username, email, password });
            console.log('Signup response', response);
            navigate('/login');
        } catch (error) {
            console.error('Signup failed', error);
            // Handle error (e.g., show a message to the user)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white p-6 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Username"
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={e => setPass(e.target.value)}
                        required
                    />
                    <Button type="submit">Create Account</Button>
                </form>
                <p className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}