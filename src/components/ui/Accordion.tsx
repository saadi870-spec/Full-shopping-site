import { useState, type ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className={cn('divide-y divide-line border-y border-line', className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              aria-controls={`panel-${item.id}`}
              className="flex w-full items-center justify-between gap-4 py-4 text-left text-[13px] font-medium text-ink transition-colors hover:text-muted"
            >
              {item.title}
              {isOpen ? (
                <Minus className="h-4 w-4 shrink-0 text-muted" />
              ) : (
                <Plus className="h-4 w-4 shrink-0 text-muted" />
              )}
            </button>
            {isOpen && (
              <div
                id={`panel-${item.id}`}
                className="animate-fade-in pb-5 text-[13px] leading-relaxed text-muted"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
