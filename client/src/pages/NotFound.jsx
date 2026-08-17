import { Link } from 'react-router-dom';
import { Logo } from '../components/Icons.jsx';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <Logo width={56} height={56} />
        <h1 className="mt-6 font-display text-7xl font-extrabold text-brand">404</h1>
        <p className="mt-2 text-lg font-semibold">Page not found</p>
        <p className="mt-1 text-muted">The reel you’re looking for isn’t here.</p>
        <Link to="/" className="btn-primary mt-6">Back to home</Link>
      </div>
    </div>
  );
}
