import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useApi } from '../../hooks/useApi';
import { changePasswordService } from '../../services/auth.service';
import { notify } from '../../utils/notify';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { run }  = useApi(changePasswordService);

  const [current, setCurrent]       = useState('');
  const [next, setNext]             = useState('');
  const [confirm, setConfirm]       = useState('');
  const [error, setError]           = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!current || !next || !confirm) {
      setError('All fields are required.');
      return;
    }
    if (next !== confirm) {
      setError('New password and confirmation do not match.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const res = await run(current, next);
    setSubmitting(false);
    if (res?.status === 1 || res?.status === '1') {
      notify.success(res.message || 'Password updated');
      navigate('/account');
    } else {
      setError(res?.message || 'Could not update password');
    }
  }

  return (
    <Layout active="profile" title="Change Password" back>
      <form className="space-y-5 max-w-md" onSubmit={onSubmit} noValidate>
        <label className="block">
          <span className="text-sm font-medium text-slate-500">Current password</span>
          <input
            type="password"
            value={current}
            onChange={(e) => { setCurrent(e.target.value); if (error) setError(null); }}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-500">New password</span>
          <input
            type="password"
            value={next}
            onChange={(e) => { setNext(e.target.value); if (error) setError(null); }}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-500">Confirm new password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); if (error) setError(null); }}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
        </label>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-gradient-r text-white text-base font-semibold rounded-xl py-3 shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </Layout>
  );
}
