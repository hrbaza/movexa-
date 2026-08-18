import { useParams, Link, Navigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const UPDATED = 'August 2026';

const DOCS = {
  privacy: {
    title: 'Privacy Policy',
    intro:
      'Your privacy matters to us. This policy explains what information Movexa collects, how we use it, and the choices you have. Movexa is a demonstration project built on the MERN stack.',
    sections: [
      {
        h: 'Information We Collect',
        list: [
          'Account details you provide: your name, email address, and a securely hashed password.',
          'Activity on the platform: your watchlist, favorites, watch history, ratings, and reviews.',
          'Technical data: basic device and browser information plus a login token stored in your browser.',
        ],
      },
      {
        h: 'How We Use Your Information',
        list: [
          'To create and secure your account and keep you signed in.',
          'To power features like continue-watching, recommendations, and your personal lists.',
          'To improve reliability, performance, and the overall experience.',
        ],
      },
      {
        h: 'How We Share Information',
        p: [
          'We do not sell your personal information. Movie metadata such as titles, posters and cast is provided by third-party sources like The Movie Database (TMDB). Hosting and database providers process data on our behalf under their own security terms.',
        ],
      },
      {
        h: 'Data Security',
        p: [
          'Passwords are hashed with industry-standard algorithms, traffic is served over HTTPS in production, and administrative tools are role-restricted. No system is perfectly secure, but we take reasonable measures to protect your data.',
        ],
      },
      {
        h: 'Your Rights',
        p: [
          'You can view and update your profile at any time, and delete your reviews, watchlist, favorites, and history from within the app. To request full account deletion, contact us.',
        ],
      },
      {
        h: 'Changes to This Policy',
        p: [
          'We may update this policy from time to time. Material changes will be reflected on this page with a new last-updated date.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    intro: 'By accessing or using Movexa, you agree to these Terms. Please read them carefully.',
    sections: [
      {
        h: 'Acceptance of Terms',
        p: ['Using Movexa means you accept these Terms and our Privacy and Cookie policies. If you do not agree, please do not use the service.'],
      },
      {
        h: 'Accounts',
        list: [
          'You are responsible for keeping your login credentials confidential.',
          'You must provide accurate information and are responsible for activity under your account.',
          'We may suspend accounts that violate these Terms or applicable law.',
        ],
      },
      {
        h: 'Acceptable Use',
        list: [
          'Do not misuse the platform, attempt to disrupt it, or access it through unauthorized means.',
          'Do not upload unlawful, infringing, or abusive content in reviews or profiles.',
        ],
      },
      {
        h: 'Content & Licensing',
        p: [
          'Movexa is designed to stream only content for which the operator holds the necessary distribution rights. This demo uses public movie metadata and Creative-Commons sample clips for playback. Unauthorized or pirated sources are not part of the service.',
        ],
      },
      {
        h: 'Intellectual Property',
        p: [
          'The Movexa name, design, and code belong to their respective owners. Movie titles, artwork, and related metadata belong to their rights holders.',
        ],
      },
      {
        h: 'Disclaimers & Liability',
        p: [
          'The service is provided as is without warranties of any kind. To the extent permitted by law, Movexa is not liable for indirect or incidental damages arising from your use of the service.',
        ],
      },
      { h: 'Changes', p: ['We may revise these Terms; continued use after changes constitutes acceptance.'] },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    intro: 'This policy explains how Movexa uses cookies and similar local-storage technologies.',
    sections: [
      {
        h: 'What Are Cookies?',
        p: ['Cookies and local storage are small pieces of data saved in your browser that let a site remember information between visits.'],
      },
      {
        h: 'How We Use Them',
        list: [
          'Essential: a secure login token that keeps you signed in.',
          'Functional: remembering preferences such as your notification settings.',
        ],
      },
      { h: 'Analytics & Advertising', p: ['This demo does not use third-party advertising or cross-site tracking cookies.'] },
      {
        h: 'Managing Cookies',
        p: ['You can clear your browser storage at any time from your browser settings. Signing out removes your stored login token.'],
      },
    ],
  },
  copyright: {
    title: 'Copyright & Attribution',
    intro: 'Movexa respects intellectual property rights and expects its users to do the same.',
    sections: [
      {
        h: 'Licensed Content Only',
        p: ['Movexa is built to distribute only content that the operator is licensed to stream. Pirated files, scraped links, or circumvention of content protection are outside the scope of the service.'],
      },
      {
        h: 'Copyright Complaints',
        p: ['If you believe content on the platform infringes your copyright, contact us with a description of the work, its location, and your contact details, and we will review and act on valid requests.'],
      },
      {
        h: 'TMDB Attribution',
        p: ['This product uses the TMDB API but is not endorsed or certified by TMDB. Movie metadata, posters, and artwork are provided by The Movie Database (themoviedb.org).'],
      },
      {
        h: 'Sample Media',
        p: ['Video playback in this demo uses Creative-Commons licensed sample clips (for example Big Buck Bunny and Sintel) purely to demonstrate the player.'],
      },
    ],
  },
};

const NAV = [
  ['privacy', 'Privacy Policy'],
  ['terms', 'Terms & Conditions'],
  ['cookies', 'Cookie Policy'],
  ['copyright', 'Copyright'],
];

export default function Legal() {
  const { doc } = useParams();
  const data = DOCS[doc];
  useDocumentTitle(data ? data.title : 'Legal');
  if (!data) return <Navigate to="/404" replace />;

  return (
    <div className="container-page max-w-6xl pt-24">
      <nav className="mb-6 text-sm text-muted">
        <Link to="/" className="hover:text-white">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{data.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {NAV.map(([key, label]) => (
              <Link
                key={key}
                to={`/legal/${key}`}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  key === doc ? 'bg-brand/20 text-white ring-1 ring-brand/40' : 'text-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </aside>

        <article className="min-w-0">
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{data.title}</h1>
          <p className="mt-2 text-sm text-muted">Last updated: {UPDATED}</p>
          <p className="mt-6 text-white/80">{data.intro}</p>

          <div className="mt-8 space-y-8">
            {data.sections.map((s) => (
              <section key={s.h}>
                <h2 className="font-display text-lg font-bold text-white">{s.h}</h2>
                {s.p &&
                  s.p.map((para, i) => (
                    <p key={i} className="mt-2 leading-relaxed text-white/75">{para}</p>
                  ))}
                {s.list && (
                  <ul className="mt-2 space-y-2">
                    {s.list.map((li, i) => (
                      <li key={i} className="flex gap-2 text-white/75">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        <span className="leading-relaxed">{li}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-xl border border-white/10 bg-card/50 p-4 text-sm text-muted">
            Questions? Reach us at <span className="text-brand-light">support@movexa.app</span>. Movexa is a
            demonstration project and this document is provided for illustrative purposes.
          </div>
        </article>
      </div>
    </div>
  );
}
