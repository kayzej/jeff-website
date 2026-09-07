import Background from '@/components/Background';

export default function HobbiesPage() {
  return (
    <main className="min-h-screen px-6 pt-16 pb-24 md:px-12">
      <Background />
      <div className="relative z-10 mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl font-bold text-white md:text-5xl">My Hobbies</h1>
        <ul className="mt-6 list-disc space-y-2 pl-5 font-mono text-base text-slate-300 md:text-lg">
          <li>Spending time with family and friends</li>
          <li>Playing Hockey, though I&apos;m on temporary hiatus :-)</li>
          <li>Building side projects and exploring new technologies</li>
          <li>Taking online courses</li>
          <li>3D Printing nifty things around the house and toys for my kids</li>
          <li>Watching pop-sci videos on youtube</li>
          <li>Reading sci-fi books</li>
          <li>Playing video games, especially strategy and simulation games</li>
        </ul>
      </div>
    </main>
  );
}
