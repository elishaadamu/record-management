"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { currentUser } = useAuth();
  
  useEffect(() => {
    if (currentUser) {
      router.push(`/${currentUser.role}`);
    } else {
      router.push('/login');
    }
  }, [currentUser, router]);

  return null;
}
