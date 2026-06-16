import { Wordmark } from "@/components";

/**
 * Minimal chrome for auth screens (sign in / sign up / reset / verify):
 * just the wordmark, no nav and no footer, so focus stays on the single action.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="site-header">
        <div className="account-shell flex justify-start">
          <Wordmark size={20} />
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
    </>
  );
}
