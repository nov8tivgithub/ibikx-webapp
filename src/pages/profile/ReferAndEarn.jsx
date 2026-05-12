import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';

export default function ReferAndEarn() {
  const [copied, setCopied] = useState(false);
  async function copyCode() {
    try {
      await navigator.clipboard.writeText('53AA6D');
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch { /* ignore */ }
  }
  return (
    <Layout active="profile" title="Refer & Earn" back>
      <div className="max-w-3xl">
        <div className="rounded-2xl bg-brand-gradient-r text-white p-6 lg:p-8 relative overflow-hidden shadow-soft">
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
          <div className="relative text-center">
            <div className="text-6xl mb-2">🎁</div>
            <h2 className="text-2xl lg:text-3xl font-extrabold">Invite friends, earn rewards</h2>
            <p className="mt-2 text-white/90 max-w-md mx-auto">Share your referral code and earn wallet points each time a friend signs up and subscribes.</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Your referral code</p>
          <div className="mt-3 flex items-center gap-3">
            <p className="text-3xl font-extrabold text-brand-blue">53AA6D</p>
            <button onClick={copyCode} className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-gradient-r text-white text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h10v10H9zM5 5h10v4M5 5v10h4" />
              </svg>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { emoji: '📤', title: '1. Share',    text: 'Send your code to friends and family.' },
            { emoji: '📝', title: '2. They join', text: 'Friends sign up using your code.' },
            { emoji: '💰', title: '3. You earn', text: 'Wallet points credited automatically.' },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl bg-white border border-slate-200 p-5 text-center">
              <div className="text-3xl mb-2">{c.emoji}</div>
              <p className="font-bold text-slate-900">{c.title}</p>
              <p className="text-xs text-slate-500 mt-1">{c.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold">WhatsApp</button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold">Facebook</button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500 text-white text-sm font-semibold">Twitter</button>
          <Link to="/wallet" className="ml-auto text-sm font-semibold text-brand-blue hover:underline">View Wallet →</Link>
        </div>
      </div>
    </Layout>
  );
}
