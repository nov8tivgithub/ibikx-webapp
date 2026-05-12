import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useApi } from '../../hooks/useApi';
import { useApiOnMount } from '../../hooks/useApiOnMount';
import { useAuth } from '../../context/AuthContext';
import { getProfileService, updateProfileService } from '../../services/profile.service';
import { notify } from '../../utils/notify';

export default function MyProfile() {
  const navigate                  = useNavigate();
  const { user, refreshUser }     = useAuth();
  const profile                   = useApiOnMount(getProfileService);
  const update                    = useApi(updateProfileService);

  const initial = {
    full_name:  user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
    email:      user?.email || '',
    phone:      user?.phone || '',
    agent_code: user?.agent_code || user?.lic_code || '',
    website:    user?.website || '',
  };

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  // When the profile API returns, seed the form (only on first load).
  useEffect(() => {
    if (profile.data) {
      setForm((prev) => ({
        full_name:  profile.data.full_name   || profile.data.name  || prev.full_name,
        email:      profile.data.email                                || prev.email,
        phone:      profile.data.phone                                || prev.phone,
        agent_code: profile.data.agent_code  || profile.data.lic_code || prev.agent_code,
        website:    profile.data.website                              || prev.website,
      }));
    }
  }, [profile.data]);

  useEffect(() => { if (profile.error) notify.error(profile.error); }, [profile.error]);

  function change(field) {
    return (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const res = await update.run(form);
    setSaving(false);
    if (res?.status === 1 || res?.status === '1') {
      refreshUser({ ...(user || {}), ...form, ...(res.data || {}) });
      notify.success(res.message || 'Profile updated');
      navigate('/account');
    } else {
      notify.error(res?.message || 'Could not save profile');
    }
  }

  return (
    <Layout active="profile" title="My Profile" back>
      <form className="space-y-5 max-w-2xl" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-500">Full name</span>
            <input type="text" value={form.full_name} onChange={change('full_name')} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-blue/30" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-500">Email</span>
            <input type="email" value={form.email} onChange={change('email')} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-blue/30" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-500">Phone</span>
            <input type="tel" value={form.phone} onChange={change('phone')} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-blue/30" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-500">Agent / LIC code</span>
            <input type="text" value={form.agent_code} onChange={change('agent_code')} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-blue/30" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-500">Website</span>
            <input type="text" value={form.website} onChange={change('website')} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-blue/30" />
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Link to="/account" className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-gradient-r disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Layout>
  );
}
