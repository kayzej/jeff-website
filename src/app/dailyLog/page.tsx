import DailyLogForm from '@/components/DailyLogForm';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function DailyLog() {
  return (
    <main className="bg-dark min-h-screen p-4">
      <div>
        <DailyLogForm />
      </div>
    </main>
  );
}
