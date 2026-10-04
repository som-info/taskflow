import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const EMPTY = { name: '', email: '', password: '' };

/** Combined login / register screen. */
export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  function switchMode() {
    setMode(isRegister ? 'login' : 'register');
    setErrors({});
    setMessage('');
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setMessage('');
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
    } catch (err) {
      setErrors(err.details || {});
      setMessage(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__panel">
        <div className="brand brand--large">✅ TaskFlow</div>
        <p className="auth__tagline">Plan, track and ship your work – one card at a time.</p>

        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          <h1>{isRegister ? 'Create your account' : 'Welcome back'}</h1>

          {isRegister && (
            <Field label="Name" name="name" value={form.name} onChange={handleChange} error={errors.name} autoComplete="name" />
          )}
          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} autoComplete="email" />
          <Field
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            hint={isRegister ? 'At least 8 characters' : undefined}
          />

          {message && !Object.keys(errors).length && <p className="alert" role="alert">{message}</p>}

          <button className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
          </button>

          <p className="auth__switch">
            {isRegister ? 'Already have an account?' : 'New to TaskFlow?'}{' '}
            <button type="button" className="link" onClick={switchMode}>
              {isRegister ? 'Sign in' : 'Create an account'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, hint, ...inputProps }) {
  const id = `field-${inputProps.name}`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} className={`input ${error ? 'input--error' : ''}`} aria-invalid={Boolean(error)} {...inputProps} />
      {error ? <span className="field__error">{error}</span> : hint && <span className="field__hint">{hint}</span>}
    </div>
  );
}
