import api from "./axios";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

// Returns { token: string, ... }
export function login(payload: LoginPayload) {
    return api.post('/auth/login', payload).then(res => res.data);
}

export function signup(payload: SignupPayload) {
    return api.post('/auth/register', payload).then(res => res.data);
}
