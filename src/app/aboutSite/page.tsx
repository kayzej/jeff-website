import Background from '@/components/Background';

export default function AboutSitePage() {
  return (
    <main className="min-h-screen px-6 pt-16 pb-24 md:px-12">
      <Background />
      <div className="relative z-10 mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl font-bold text-white md:text-5xl">About This Site</h1>
        <p className="mt-4 font-mono text-base text-slate-300 md:text-lg">
          A quick rundown of what this site is built with.
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-5 font-mono text-base text-slate-300 md:text-lg">
          <li>⚛️ Next.js 15 (App Router) with React and TypeScript</li>
          <li>🎨 Tailwind CSS for styling, plus Material UI components</li>
          <li>✅ ESLint and Prettier for linting and formatting</li>
          <li>▲ Hosted on Vercel, auto-deployed from the master branch</li>
        </ul>
      </div>
    </main>
  );
}
