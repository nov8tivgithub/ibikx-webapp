import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';

// Renders the personalised card returned by /personalizecard. The previous
// page (CardDetails) navigates here with the response in location.state.
// If the personalised payload exposes a `preview_url` we embed it; otherwise
// we fall back to a stamped composition built from the user's profile.

export default function PersonalisedCard() {
  const [fav, setFav]   = useState(false);
  const { user }        = useAuth();
  const location        = useLocation();
  const personalised    = location.state?.personalised || {};
  const source          = location.state?.source       || {};

  // Backend may return a rendered image / preview URL.
  const previewUrl =
    personalised.preview_url || personalised.image || personalised.url || null;

  const heading        = source.heading || personalised.heading || 'പോളിസി പുതുക്കൽ, പോളിസി വാങ്ങുന്നതുപോലെ തന്നെ പ്രധാനമാണ്!';
  const subline        = source.subline || personalised.subline || 'അവസാനിക്കുന്ന ഇൻഷുറൻസ് പുതുക്കൽ';
  const banner         = source.banner_text || personalised.banner_text || 'എൽഐസി പോളിസി പുതുക്കൽ';
  const description    = source.description || personalised.description || 'നിങ്ങൾക്ക് കരുതാൻ കഴിയാത്ത അവസ്ഥ വന്നാൽ നിങ്ങളുടെ കുടുംബം സാമ്പത്തികമായി സുരക്ഷിതരായിരിക്കും.';

  const userName       = user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.name || 'David John';
  const userPhone      = user?.phone || '8075758209';
  const userEmail      = user?.email || 'test100@icwares.com';
  const userInitials   = (userName.match(/\b\w/g) || []).slice(0, 2).join('').toUpperCase() || 'DJ';

  function onShare() {
    if (navigator.share) {
      navigator.share({ title: heading, url: previewUrl || window.location.href }).catch(() => {});
    }
  }

  return (
    <Layout active="home" title={source.breadcrumb || personalised.breadcrumb || 'Personalised Card'} back>
      <div className="relative max-w-md mx-auto">
        <div className="rounded-3xl overflow-hidden shadow-2xl bg-white">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Personalised card"
              className="block w-full aspect-[3/4] object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="aspect-[3/4] bg-blue-900 relative text-white">
              <div className="absolute top-3 right-3 text-right text-[10px]">
                <p className="font-bold">Mobilix</p>
                <p className="font-bold">ideas <span className="font-normal">Caards</span></p>
                <p className="opacity-80 mt-0.5">ideascaards.com/getapp</p>
              </div>
              <p className="absolute top-3 left-4 text-[10px] opacity-80">{userName}, {userPhone}</p>

              <div className="absolute top-14 left-3 right-3 bg-red-600 text-white text-center font-bold text-sm py-2 rounded">
                {banner}
              </div>

              <div className="absolute top-28 left-3 right-3 text-center">
                <p className="font-bold text-base leading-tight">{subline}</p>
                <p className="font-bold text-base leading-tight mt-1">{heading}</p>
                <p className="text-xs opacity-90 mt-3 leading-snug">{description}</p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-white text-slate-900 px-3 py-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                  {user?.imagelink
                    ? <img src={user.imagelink} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    : userInitials}
                </div>
                <div className="flex-1 min-w-0 text-[10px] leading-tight">
                  <p className="font-bold text-sm">{userName}</p>
                  <p className="text-slate-600">Life/Health/General Insurance Advisor</p>
                  <p className="font-semibold mt-0.5">{userPhone}, {userEmail}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 right-2 lg:-right-16 flex flex-col gap-3">
          <button
            onClick={() => setFav((v) => !v)}
            className="w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center hover:scale-105 transition"
            aria-label="Save"
          >
            <svg className="w-5 h-5" fill={fav ? '#ef4444' : 'none'} stroke={fav ? '#ef4444' : 'currentColor'} strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <button onClick={onShare} className="w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-slate-700 hover:scale-105 transition" aria-label="Share">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l18-9-7 18-2-7-9-2z" />
            </svg>
          </button>
          <button onClick={onShare} className="w-12 h-12 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center hover:scale-105 transition" aria-label="Send on WhatsApp">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1s-.7.9-.8 1c-.2.2-.3.2-.6.1-1.6-.8-2.7-1.4-3.7-3.2-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5l-.9-2c-.2-.5-.5-.5-.6-.5h-.5c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2.1 3.2 5 4.4 1.7.7 2.4.8 3.3.6.5-.1 1.6-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z" /></svg>
          </button>
        </div>
      </div>
    </Layout>
  );
}
