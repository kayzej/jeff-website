import Background from '@/components/Background';

export default function QuickFactsPage() {
  return (
    <main className="min-h-screen px-6 pt-16 pb-24 md:px-12">
      <Background />
      <div className="relative z-10 mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl font-bold text-white md:text-5xl">Quick Facts</h1>
        <ul className="mt-6 list-disc space-y-2 pl-5 font-mono text-base text-slate-300 md:text-lg">
          <li>Location: New Jersey</li>
          <li>Husband and Father to two beautiful agents of chaos</li>
          <li>Passionate about improving physical and mental well-being</li>
          <li>Recently completed a course on Agentic AI</li>
          <li>Improving my skills in Site Reliability Engineering</li>
        </ul>
      </div>
    </main>
  );
}
