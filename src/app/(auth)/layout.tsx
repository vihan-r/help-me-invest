import { Wordmark } from "@/components";

/**
 * Minimal chrome for auth screens (sign in / sign up / reset / verify):
 * just the wordmark, no nav and no footer, so focus stays on the single action.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="site-header">
        <div className="account-shell" style={{ display: "flex", justifyContent: "flex-start" }}>
          <Wordmark size={20} />
        </div>
      </header>
      {children}
    </>
  );
}
