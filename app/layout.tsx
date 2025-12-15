import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AMBIT',
  description:
    'AMBIT helps small service companies track and match to government contract opportunities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <header className="border-b">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <Link href="/" className="text-sm font-semibold tracking-wide">
              AMBIT
            </Link>

            <nav className="flex flex-wrap items-center gap-4 text-xs md:text-sm">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/signup" className="hover:underline">
                Signup
              </Link>
              {/* Demo matches points to customer 1 */}
              <Link href="/matches/1" className="hover:underline">
                Demo matches
              </Link>
              <Link href="/admin/customers" className="hover:underline">
                Admin – customers
              </Link>
              <Link href="/admin/opportunities" className="hover:underline">
                Admin – opportunities
              </Link>
            </nav>
          </div>
        </header>

        {/* Page content */}
        {children}
      </body>
    </html>
  );
}
