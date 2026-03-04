import { Link } from "react-router-dom";

export function PageContainer({ title, subtitle, action, children, className = "" }) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-lg ${className}`}>{children}</div>;
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function buttonBase(className) {
  return `inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed ${className}`;
}

export function PrimaryButton({ children, className = "", ...props }) {
  return <button className={buttonBase(`bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm ${className}`)} {...props}>{children}</button>;
}

export function SecondaryButton({ children, className = "", ...props }) {
  return <button className={buttonBase(`border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 ${className}`)} {...props}>{children}</button>;
}

export function DangerButton({ children, className = "", ...props }) {
  return <button className={buttonBase(`bg-red-500 text-white hover:bg-red-600 ${className}`)} {...props}>{children}</button>;
}

export function InputField({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>}
      <input className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${className}`} {...props} />
    </label>
  );
}

export function SelectField({ label, className = "", children, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>}
      <select className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${className}`} {...props}>{children}</select>
    </label>
  );
}

export function TextAreaField({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>}
      <textarea className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${className}`} {...props} />
    </label>
  );
}

export function Badge({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    yellow: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.gray}`}>{children}</span>;
}

export function EmptyState({ title, description, action }) {
  return (
    <Card className="text-center py-10">
      <p className="text-base font-medium text-gray-900">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}

export function DataTable({ columns, data }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>{columns.map((col) => <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{col.title}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, idx) => (
            <tr key={row.id || idx} className="hover:bg-gray-50">
              {columns.map((col) => <td key={col.key} className="px-4 py-3 text-sm text-gray-700">{col.render ? col.render(row) : row[col.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Avatar({ name }) {
  const initial = (name || "U").charAt(0).toUpperCase();
  return <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 font-semibold text-white">{initial}</div>;
}

export function StatCard({ title, value, icon, tone = "indigo" }) {
  const tones = {
    indigo: "from-indigo-500 to-indigo-600",
    purple: "from-purple-500 to-indigo-500",
    emerald: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-500",
  };
  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
      <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${tones[tone]} text-white flex items-center justify-center`}>{icon}</div>
    </Card>
  );
}

export function NavCardLink({ to, title, subtitle }) {
  return (
    <Link to={to} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
    </Link>
  );
}
