import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import RecipeList from './components/RecipeList';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AuthenticatedApp() {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="app-header">
        <h1>My Cookbook</h1>
        <div className="user-info">
          <span>Welcome, {user?.email}</span>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>
      <main className="app-main">
        <RecipeList />
      </main>
    </div>
  );
}

function UnauthenticatedApp() {
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();

  const handleLogin = (user) => {
    login(user);
  };

  const handleRegister = (user) => {
    login(user);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>My Cookbook</h1>
      </header>
      <main className="app-main auth-main">
        {isLogin ? (
          <Login
            onLogin={handleLogin}
            switchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <Register
            onRegister={handleRegister}
            switchToLogin={() => setIsLogin(true)}
          />
        )}
      </main>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <ProtectedRoute>
      <AuthenticatedApp />
    </ProtectedRoute>
  ) : (
    <UnauthenticatedApp />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
