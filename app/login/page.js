import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const metadata = {
  title: 'Anmelden — Central Communication Hub (CCH)',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
