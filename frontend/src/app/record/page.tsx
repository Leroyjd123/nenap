'use client';

import { AuthGuard } from '@/components/auth-guard';
import { RecordFirst } from '@/components/record-first';

export default function RecordPage() {
  return (
    <AuthGuard>
      <RecordFirst />
    </AuthGuard>
  );
}
