export const JOB_TYPES = [
  { value: 'full_time', label: 'Temps plein' },
  { value: 'part_time', label: 'Temps partiel' },
  { value: 'internship', label: 'Stage' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contract', label: 'CDD' },
  { value: 'cdi', label: 'CDI' },
];

export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Débutant' },
  { value: 'junior', label: 'Junior (1-3 ans)' },
  { value: 'mid', label: 'Confirmé (3-5 ans)' },
  { value: 'senior', label: 'Senior (5+ ans)' },
  { value: 'lead', label: 'Lead / Manager' },
];

export const EDUCATION_LEVELS = [
  { value: 'none', label: 'Aucun' },
  { value: 'cap', label: 'CAP/BEP' },
  { value: 'bepc', label: 'BEPC' },
  { value: 'bacc', label: 'Baccalauréat' },
  { value: 'bts', label: 'BTS/DUT' },
  { value: 'licence', label: 'Licence' },
  { value: 'master', label: 'Master' },
  { value: 'doctorat', label: 'Doctorat' },
  { value: 'autre', label: 'Autre' },
];

export const COMPANY_SIZES = [
  { value: 'micro', label: '1-10 employés' },
  { value: 'small', label: '11-50 employés' },
  { value: 'medium', label: '51-250 employés' },
  { value: 'large', label: '251-1000 employés' },
  { value: 'enterprise', label: '1000+ employés' },
];

export const APPLICATION_STATUSES = [
  { value: 'pending', label: 'En attente' },
  { value: 'reviewed', label: 'Consultée' },
  { value: 'shortlisted', label: 'Présélectionnée' },
  { value: 'rejected', label: 'Rejetée' },
  { value: 'hired', label: 'Recrutée' },
];

export function labelFor(list, value) {
  return list.find((i) => i.value === value)?.label || value || '—';
}

export function statusBadgeClass(status) {
  switch (status) {
    case 'hired':
      return 'badge-ok';
    case 'rejected':
      return 'badge-clay';
    case 'shortlisted':
      return 'badge-gold';
    default:
      return 'badge-forest';
  }
}

export function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n);
  if (min && max) return `${fmt(min)} - ${fmt(max)} FCFA`;
  if (min) return `À partir de ${fmt(min)} FCFA`;
  return `Jusqu'à ${fmt(max)} FCFA`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(dateStr)
  );
}

export function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 30) return `il y a ${Math.floor(diff / 86400)} j`;
  return formatDate(dateStr);
}

export const MEDIA_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');

export function mediaUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${MEDIA_BASE}${path}`;
}
