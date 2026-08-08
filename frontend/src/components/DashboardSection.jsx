export default function DashboardSection({ label, title, action, children }) {
  return (
    <section className="dashboard-section">
      <div className="dashboard-section-head">
        <div>
          {label && <span className="section-label">{label}</span>}
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
