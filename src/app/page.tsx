// import MyComponent from "../components/MyComponent";
// import { BASE_URL } from '../constants/constants';
// import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyForm from '@/components/MyForm';

// async function getData() {
//   const res = await fetch(`${BASE_URL}/helloworld`);

//   if (!res.ok) {
//     // This will activate the closest `error.js` Error Boundary
//     throw new Error('Failed to fetch data');
//   }

//   return res.json();
// }

export default async function Home() {
  // const data = await getData();
  return (
    <main className="flex min-h-screen items-center justify-between p-24">
      <div>
        <h1 className="font-extrabold">Welcome to Jeff{'\u0027'}s Website!</h1>
        <p>Enter your name and a message and I will save it to my database!</p>
        {/* <MyComponent></MyComponent> */}
        {/* {data?.message ? <p>Server Fetch: {data.message}</p> : <p>No data</p>} */}
        <MyForm></MyForm>
      </div>
    </main>
  );
}
