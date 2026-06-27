import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useAuth } from '../../../shared/hooks/useAuth';

export const AuthPage = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, username, password);
      }
      navigate('/');
    } catch {
      setError(t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-md rounded-[32px] border border-[var(--border)] bg-[var(--card)] p-10 shadow-xl">
        <h1 className="mb-6 text-3xl font-semibold text-[var(--card-foreground)]">
          {mode === 'login' ? t('auth.welcome.back') : t('auth.create.account')}
        </h1>
        <p className="mb-6 text-sm text-[var(--muted-foreground)]">
          {mode === 'login' ? t('auth.login.desc') : t('auth.register.desc')}
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
              htmlFor="email"
            >
              {t('auth.email')}
            </label>
            <Input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('auth.email.placeholder')}
              required
            />
          </div>
          {mode === 'register' ? (
            <div>
              <label
                className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                htmlFor="username"
              >
                {t('auth.username')}
              </label>
              <Input
                id="username"
                type="text"
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder={t('auth.username.placeholder')}
                required
              />
            </div>
          ) : null}
          <div>
            <label
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
              htmlFor="password"
            >
              {t('auth.password')}
            </label>
            <Input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('auth.password.placeholder')}
              required
            />
          </div>
          {error ? (
            <p className="text-sm text-[var(--destructive)]">{error}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? t('auth.processing')
              : mode === 'login'
                ? t('auth.signin')
                : t('auth.register')}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
          {mode === 'login' ? (
            <>
              {t('auth.new')}{' '}
              <button
                className="text-[var(--foreground)] underline"
                onClick={() => setMode('register')}
              >
                {t('auth.create.account')}
              </button>
            </>
          ) : (
            <>
              {t('auth.existing')}{' '}
              <button
                className="text-[var(--foreground)] underline"
                onClick={() => setMode('login')}
              >
                {t('auth.signin')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
