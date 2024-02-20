import { Box, TextField } from "@mui/material";
import MyComponent from "../components/MyComponent";
import { BASE_URL } from "../constants/constants";

async function getData() {
  const res = await fetch(`${BASE_URL}/helloworld`);

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }

  return res.json();
}

export default async function Home() {
  const data = await getData();
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1 className="font-extrabold">Welcome to Jeff{'\u0027'}s Website!</h1>
        <p>We are currently under maintenance and will be up and running soon!</p>
        <MyComponent></MyComponent>
        {data?.message ? <p>Server Fetch: {data.message}</p> : <p>No data</p>}
        <Box className="my-6">
          <TextField placeholder="First Name">

          </TextField>
        </Box>
      </div>
    </main>
  );
}
