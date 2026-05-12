export default function Loader({ label }) {
  return (
    <div className="fullscreen-loader">
      <div className="loader-spinner" />
      {label ? <p className="loader-text">{label}</p> : null}
    </div>
  );
}
