import { Link } from 'react-router-dom';
import { Logo } from './Icons.jsx';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-surface/50">
      <div className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <Logo width={28} height={28} />
              <span className="font-display text-lg font-extrabold">
                MOVE<span className="text-brand">XA</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted">
              Stream movies & shows in a sleek, cinematic experience.
            </p>
          </div>

          <FooterCol title="Browse" links={[['Home', '/'], ['Movies', '/movies'], ['Genres', '/genres'], ['Search', '/search']]} />
          <FooterCol title="Account" links={[['Sign in', '/login'], ['Watchlist', '/watchlist'], ['Favorites', '/favorites'], ['History', '/history']]} />
          <FooterCol title="Legal" links={[['Privacy Policy', '/'], ['Terms & Conditions', '/'], ['Cookie Policy', '/'], ['Copyright', '/']]} />
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Movexa. Demo project — streams only licensed & CC content.</p>
          <p>Built with the MERN stack.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-white">{title}</h4>
      <ul className="space-y-2">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-sm text-muted transition hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
