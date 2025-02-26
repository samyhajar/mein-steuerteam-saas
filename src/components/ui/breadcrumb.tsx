import { cn } from '@/lib/utils';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import * as React from 'react';

const Breadcrumb = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ className, ...props }, ref) => (
  <nav ref={ref} aria-label="breadcrumb" className={cn('flex items-center text-sm', className)} {...props} />
));
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.OlHTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => (
    <ol ref={ref} className={cn('flex flex-wrap items-center gap-1 md:gap-2', className)} {...props} />
  ),
);
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('inline-flex items-center gap-1 md:gap-2', className)} {...props} />
  ),
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('opacity-50', className)} aria-hidden="true" {...props}>
      <ChevronRight className="h-4 w-4" />
    </li>
  ),
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbEllipsis = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('flex items-center opacity-50', className)} {...props}>
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More</span>
    </li>
  ),
);
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  return (
    <a ref={ref} className={cn('cursor-pointer transition-colors hover:text-muted-foreground', className)} {...props} />
  );
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('font-normal text-muted-foreground', className)} aria-current="page" {...props} />
  ),
);
BreadcrumbPage.displayName = 'BreadcrumbPage';

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
