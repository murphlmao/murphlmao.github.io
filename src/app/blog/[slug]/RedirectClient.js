"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectClient({ slug }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/articles/${slug}`);
  }, [router, slug]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-zinc-500">Redirecting...</p>
    </div>
  );
}
