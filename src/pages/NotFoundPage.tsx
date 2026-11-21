import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[62vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-[clamp(5rem,14vw,9rem)] leading-none text-ink/15">404</p>
      <h1 className="-mt-4 text-3xl text-ink sm:text-[34px]">This page has moved on</h1>
      <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-muted">
        The page you're looking for is no longer here. The collection, however, is right where you
        left it.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button to="/">Back to home</Button>
        <Button to="/products" variant="outline">
          <ArrowLeft className="h-4 w-4" /> Browse products
        </Button>
      </div>
    </div>
  );
}
