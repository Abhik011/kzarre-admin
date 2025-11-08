'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 2100); // delay to show animation
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <DotLottieReact
        src="https://lottie.host/e7734f21-27e6-4769-9e36-eb602fe2643b/AU382x6oe3.lottie"
        loop
        autoplay
        speed={3} // slower: 0.5x speed, 2 = double speed
        style={{ width: 500, height: 500 }}
      />

    </div>
  );
}
