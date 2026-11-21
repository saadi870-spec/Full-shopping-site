import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Mail } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', to: '/products' },
      { label: 'New arrivals', to: '/products?sort=newest' },
      { label: 'Best sellers', to: '/products?sort=popularity-desc' },
      { label: 'On sale', to: '/products?sale=true' },
      { label: 'Wishlist', to: '/wishlist' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { label: 'Women', to: '/products?category=womens-dresses' },
      { label: 'Men', to: '/products?category=mens-shirts' },
      { label: 'Beauty', to: '/products?category=beauty' },
      { label: 'Home', to: '/products?category=home-decoration' },
      { label: 'Technology', to: '/products?category=laptops' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', to: '/login' },
      { label: 'Create account', to: '/register' },
      { label: 'Order history', to: '/account/orders' },
      { label: 'Settings', to: '/account/settings' },
      { label: 'Admin studio', to: '/admin' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-muted">
              A considered marketplace for everyday objects, wardrobe staples and quiet design. Curated
              in small editions, shipped from independent studios.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Instagram"
                className="grid h-9 w-9 place-items-center border border-line text-ink transition-colors hover:bg-ink hover:text-bg"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Facebook"
                className="grid h-9 w-9 place-items-center border border-line text-ink transition-colors hover:bg-ink hover:text-bg"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="YouTube"
                className="grid h-9 w-9 place-items-center border border-line text-ink transition-colors hover:bg-ink hover:text-bg"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[13px] text-ink-soft transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-muted">
            © {new Date().getFullYear()} ShopSphere. Portfolio demo — product data from DummyJSON.
          </p>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.14em] text-muted">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> hello@shopsphere.dev
            </span>
            <span className="hidden h-3 w-px bg-line sm:block" />
            <span className="hidden gap-2 sm:flex">
              <span>Visa</span>
              <span>Mastercard</span>
              <span>Amex</span>
              <span>PayPal</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
