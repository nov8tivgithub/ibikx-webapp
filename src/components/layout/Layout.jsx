import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';

// Pass `loading` true on a fetch-driven page until its first response lands.
// While loading, the main content area is replaced by a centered spinner so
// the page's children never render with empty/placeholder data.
export default function Layout({ active, title, back = false, loading = false, children }) {
  return (
    <>
      <Sidebar active={active} />
      <div className="with-sidebar min-h-screen">
        <Topbar title={title} back={back} />
        <main className="px-4 lg:px-8 py-6">
          {loading ? <PageSpinner /> : children}
        </main>
        <Footer />
      </div>
    </>
  );
}

function PageSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
      <div className="loader-spinner" aria-hidden="true" />
      <p className="loader-text mt-4">Loading…</p>
    </div>
  );
}
