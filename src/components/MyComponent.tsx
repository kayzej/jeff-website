'use client';
import { useEffect, useState } from 'react';

export default function MyComponent() {
  const [jsonResponse, setJsonResponse] = useState('');

  useEffect(() => {
    fetch('/backend/helloworld')
      .then((response) => response.json())
      .then((data) => {
        setJsonResponse(data.message);
        console.log('client: ', data.message);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return <div>{jsonResponse ? <p>Client Fetch: {jsonResponse}</p> : <p>Loading</p>}</div>;
}
