'use client';

import { useEffect } from 'react';

export default function MyComponent() {
  let jsonResponse;

  useEffect(() => {
    fetch('/api/jeff-website-api-0.0.1-SNAPSHOT/helloworld')
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        jsonResponse = data;
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  });

  return (
    <div>
      <p>Response: {jsonResponse} </p>
    </div>
  );
}
