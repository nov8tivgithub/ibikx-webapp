import Layout from '../../components/layout/Layout';
import SettingsRow from '../../components/common/SettingsRow';

export default function About() {
  return (
    <Layout active="profile" title="About Us" back>
      <div className="max-w-2xl">
        <SettingsRow title="Terms and conditions" external to="#" iconPath="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6" />
        <SettingsRow title="Privacy Policy" external to="#" iconPath="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <SettingsRow title="About Us" external to="#" iconPath="M12 8v4M12 16h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />
        <div className="mt-12 text-center text-slate-500">
          <p className="font-bold text-slate-900">Mobilix Ideas Caards</p>
          <p className="text-sm mt-1">Version 2.8.6</p>
        </div>
      </div>
    </Layout>
  );
}
