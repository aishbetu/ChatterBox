import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useContext, useState } from "react";
import { login } from "../api/auth";
import { AuthContext } from "../context/AuthContext";

export const Login = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const auth = useContext(AuthContext)!;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('login', { username, password });
        try {
            const { token, user_id } = await login({ username, password });
            auth.login(token, user_id);
        } catch (error) {
            console.error('Login failed', error);
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white p-6 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-4">Login</h1>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="User Name"
                        type="username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <Button type="submit">Sign In</Button>
                </form>
                <p className="mt-4 text-center text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-600 hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}