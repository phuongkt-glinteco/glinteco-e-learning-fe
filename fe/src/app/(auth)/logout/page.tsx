'use client';

import {useAuth} from '@/providers/AuthProvider';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

export default function LogoutPage() {
  const {logout} = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function performLogout() {
      await logout();
      router.push('/login');
    }
    performLogout();
  }, [logout, router]);

  return null; // or a loading spinner if you want to show something while logging out
}