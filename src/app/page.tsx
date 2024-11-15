import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '@/components/NavBar';

export default async function Home() {
  return (
    <body>
      <main>
        <div className="absolute top-[43%] left-[50%] transform -translate-x-1/2 justify-center items-center">
          <div>
            <h1 className="font-bold font-serif">Jeffrey Kayzerman</h1>
          </div>
          <div className="mt-4">
            <Navbar />
          </div>
        </div>
      </main >
    </body>
  );
}
