import { useIsFetching, useIsMutating } from '@tanstack/react-query';

/**
 * A slim indeterminate loading bar pinned to the top of the viewport.
 * Visible whenever any React Query fetch or mutation is in flight.
 */
export default function TopProgressBar() {
  const busy = useIsFetching() + useIsMutating();

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] overflow-hidden transition-opacity duration-300 ${
        busy ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      <div className="h-full w-2/5 rounded-r-full bg-gradient-to-r from-brand/40 via-brand to-brand-light shadow-glow animate-[loadingbar_1.1s_ease-in-out_infinite]" />
    </div>
  );
}
