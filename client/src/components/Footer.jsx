import { Link } from 'react-router-dom';
import { Logo } from './Icons.jsx';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-surface/50">
      <div className="container-page py-8">
        <div className="grid grid-cols-3 gap-x-4 gap-y-8 md:grid-cols-4">
          <div className="col-span-3 md:col-span-1">
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
          <FooterCol title="Legal" links={[['Privacy Policy', '/legal/privacy'], ['Terms & Conditions', '/legal/terms'], ['Cookie Policy', '/legal/cookies'], ['Copyright', '/legal/copyright']]} />
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Movexa. All rights reserved.</p>
          <p>Made by Hamza.</p>
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
