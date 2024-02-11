'use client';

import { useEffect, useState } from 'react';

export default function MyComponent() {
  const [jsonResponse, setJsonResponse] = useState('');

  useEffect(() => {
    fetch('/api/helloworld')
      .then((response) => response.json())
      .then((data) => {
        setJsonResponse(data.message);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }),
    [];

  return (
    <div>
      <p>Response: {jsonResponse} </p>
    </div>
  );
}
