// ✅ CORRECT - With types
import { ReactNode } from 'react';
import Layout from '@/Components/layout/Layout';

export default function CmsLayout({ 
  children 
}: { 
  children: ReactNode 
}) {
  return <Layout>{children}</Layout>;
}