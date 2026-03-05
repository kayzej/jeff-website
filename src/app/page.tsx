import 'bootstrap/dist/css/bootstrap.min.css';
import AbstractBackground from '@/components/AbstractBackground';

export default async function Home() {
  return (
    <main>
      <AbstractBackground />
      <div className="absolute top-[43%] left-[50%] transform -translate-x-1/2 justify-center items-center">
        <h1 className="font-bold text-white font-serif">Jeffrey Kayzerman</h1>
      </div>
    </main>
  );
}
