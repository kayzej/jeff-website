'use client';

import { useState } from 'react';
import Image from 'next/image';
import Background from '@/components/Background';

const prints = [
  { src: '/3d_printer/sysphus.png', caption: 'One must imagine Sisyphus happy' },
  { src: '/3d_printer/remote_holder.png', caption: 'Remote Control Holder' },
  { src: '/3d_printer/girls_collection.png', caption: '3D printed animals for the kids' },
  { src: '/3d_printer/girls_chess.png', caption: 'Chess Set for my 4 year old' },
  { src: '/3d_printer/dad_chess.png', caption: "Chess Set for me. I'll put on the wood stain some day" },
  { src: '/3d_printer/dad_queen.png', caption: 'The queen is looking good!' },
  { src: '/3d_printer/dad_lion.png', caption: 'Just a cool lion' },
  { src: '/3d_printer/dad_dinosaur.png', caption: 'Triceratops ' },
];

export default function HobbiesPage() {
  const [focused, setFocused] = useState<(typeof prints)[number] | null>(null);

  return (
    <main className="min-h-screen px-6 pt-16 pb-24 md:px-12">
      <Background />
      <div className="relative z-10 mx-auto max-w-5xl">
        <h1 className="font-serif text-4xl font-bold text-white md:text-5xl">My Hobbies</h1>
        <ul className="mt-6 list-disc space-y-2 pl-5 font-mono text-base text-slate-300 md:text-lg">
          <li>👨‍👩‍👧‍👦 Spending time with family and friends</li>
          <li>🏒⛳ Playing Hockey and Golf</li>
          <li>💻 Building side projects and exploring new technologies</li>
          <li>📚 Taking online courses</li>
          <li>🖨️ 3D Printing nifty things around the house and toys for my kids</li>
          <li>🔬 Watching pop-sci videos on youtube</li>
          <li>📖 Reading sci-fi books</li>
          <li>🎮 Playing video games, especially strategy and simulation games</li>
        </ul>

        <h2 className="mt-16 font-serif text-3xl font-bold text-white md:text-4xl">3D Printed Items</h2>
        <p className="mt-4 font-mono text-base text-slate-300 md:text-lg">
          A few things I&apos;ve printed for the house and the kids.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {prints.map((item) => (
            <div key={item.src} className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setFocused(item)}
                className="relative aspect-square overflow-hidden rounded-2xl border border-slate-700/50 shadow-2xl transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                aria-label={`View larger image: ${item.caption}`}
              >
                <Image
                  src={item.src}
                  alt={item.caption}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </button>
              <p className="text-center font-mono text-sm text-slate-300 md:text-base">{item.caption}</p>
            </div>
          ))}
        </div>
      </div>

      {focused && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 py-12"
          onClick={() => setFocused(null)}
        >
          <button
            type="button"
            onClick={() => setFocused(null)}
            className="absolute top-6 right-6 font-mono text-sm text-slate-200 hover:text-white"
            aria-label="Close"
          >
            Close ✕
          </button>
          <div className="flex max-h-full max-w-4xl flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative max-h-[80vh] w-full">
              <Image
                src={focused.src}
                alt={focused.caption}
                width={1200}
                height={1200}
                sizes="100vw"
                className="max-h-[80vh] w-auto rounded-2xl object-contain"
              />
            </div>
            <p className="text-center font-mono text-sm text-slate-200 md:text-base">{focused.caption}</p>
          </div>
        </div>
      )}
    </main>
  );
}
