import { Link, useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const navigate = useNavigate();
  function onSubmit(e) {
    e.preventDefault();
    alert('Reset link sent (mockup)');
    navigate('/login');
  }
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <section className="bg-brand-gradient text-white px-6 py-10 lg:px-16 lg:py-16 lg:w-1/2 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }} />
        <div className="relative max-w-md">
          <img src="/assets/img/logo.png" alt="Mobilix IdeasCaards" className="h-28 lg:h-40 mx-auto" />
          <h2 className="text-3xl lg:text-5xl font-bold leading-tight mt-12">Forgot Password?</h2>
          <p className="mt-3 text-white/85 text-base lg:text-lg">We'll send a reset link to your registered email.</p>
        </div>
      </section>
      <section className="bg-white flex-1 px-6 py-8 lg:px-16 lg:py-16 lg:w-1/2 flex items-center">
        <form className="w-full max-w-md mx-auto space-y-5" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-500">Registered email</span>
            <input type="email" required placeholder="you@example.com" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-blue/30" />
          </label>
          <button type="submit" className="w-full bg-brand-gradient-r text-white text-base font-semibold rounded-xl py-3 shadow-soft">Send reset link</button>
          <p className="text-center text-sm text-slate-500">
            Remembered it? <Link to="/login" className="font-bold text-brand-blue hover:underline">Back to login</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
