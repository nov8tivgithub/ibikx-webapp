import Layout from '../../components/layout/Layout';
import SettingsRow from '../../components/common/SettingsRow';

export default function Account() {
  return (
    <Layout active="profile" title="My Account" back>
      <div className="max-w-2xl">
        <SettingsRow title="My Profile" to="/my-profile" iconPath="M16 14a4 4 0 1 0-8 0M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5 21a7 7 0 0 1 14 0" />
        <SettingsRow title="Crop Profile Image" external to="#" iconPath="M16 14a4 4 0 1 0-8 0M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5 21a7 7 0 0 1 14 0" />
        <SettingsRow title="Change Password" to="/change-password" iconPath="M12 15v2M6 10h12v10H6zM9 10V7a3 3 0 0 1 6 0v3" />
        <SettingsRow title="Delete Account" external to="#" iconPath="M12 8v4M12 16h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />
        <div className="mt-12 text-center text-slate-500">
          <p className="font-bold text-slate-900">Mobilix Ideas Caards</p>
          <p className="text-sm mt-1">Version 2.8.6</p>
        </div>
      </div>
    </Layout>
  );
}
