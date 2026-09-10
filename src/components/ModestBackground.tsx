import Image from 'next/image';
import Background from '@/components/Background';

export default function ModestBackground() {
  return (
    <>
      <Background />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center gap-12 px-6 pt-24 md:flex-row md:items-start md:justify-between md:gap-16 md:px-12 md:pt-20">
        <div className="max-w-xl text-center md:text-left">
          <h1 className="font-serif text-4xl font-bold text-white md:text-5xl">Jeffrey Kayzerman</h1>
          <p className="mt-4 font-mono text-base text-slate-300 md:text-lg">
            Hi, I&apos;m Jeff. Software architect, engineer and AI specialist. I design systems that hold up in the real
            world. I&apos;ve built software across very different worlds: large banks, a B2B SaaS startup, a B2C
            Consumer platform, and systems architecture for a defense manufacturer. Lately I&apos;ve been focused on
            agentic AI, and specifically how to architect multi-model systems that are fast, cost-aware, and reliable
            enough for production. This is where I share what I&apos;m building, what I&apos;m learning and a little bit
            of my personal life and thoughts.
          </p>
          <h2 className="mt-8 font-serif text-2xl font-bold text-white md:text-3xl">I&apos;d love to connect!</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-left font-mono text-base text-slate-300 md:text-lg">
            <li>
              LinkedIn:{' '}
              <a href="https://www.linkedin.com/in/jeffrey-kayzerman/" className="text-blue-400 hover:text-blue-300">
                Jeffrey Kayzerman
              </a>
            </li>
            <li>Email me at jeffrey.kayzerman@gmail.com</li>
          </ul>
          <p className="mt-8 font-mono text-base text-slate-300 md:text-lg">
            While you&apos;re here, check out my{' '}
            <a href="/quickFacts" className="text-blue-400 hover:text-blue-300">
              Quick Facts
            </a>{' '}
            <a href="/hobbies" className="text-blue-400 hover:text-blue-300">
              Hobbies
            </a>{' '}
          </p>
        </div>
        <div className="shrink-0">
          <Image
            src="/Jeff Portfolio Image.png"
            alt="Jeff Kayzerman"
            width={340}
            height={255}
            priority
            className="rounded-2xl border border-slate-700/50 object-cover shadow-2xl"
          />
        </div>
      </div>
    </>
  );
}
