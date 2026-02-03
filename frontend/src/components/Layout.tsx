import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="page">
      {title && (
        <header>
          <h1>{title}</h1>
        </header>
      )}
      {children}
    </div>
  );
}
