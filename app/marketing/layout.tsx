import Layout from '@/components/layout/Layout.jsx';
import type { ReactNode } from 'react';

type EcomLayoutProps = {
  children: ReactNode;
};

export default function EcomLayout({ children }: EcomLayoutProps) {
  return <Layout>{children}</Layout>;
}