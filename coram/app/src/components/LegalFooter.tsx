import { Link } from 'react-router-dom';

export function LegalFooter() {
  return (
    <footer className="border-t border-slate-200 px-4 py-5 text-xs font-semibold text-slate-500 md:px-6">
      <div className="flex flex-wrap gap-3">
        <Link to="/legal/privacidad" className="hover:text-[#0B2545]">Privacidad</Link>
        <Link to="/legal/terminos" className="hover:text-[#0B2545]">Terminos</Link>
        <Link to="/legal/cookies" className="hover:text-[#0B2545]">Cookies</Link>
        <Link to="/legal/reembolsos" className="hover:text-[#0B2545]">Reembolsos</Link>
      </div>
    </footer>
  );
}
