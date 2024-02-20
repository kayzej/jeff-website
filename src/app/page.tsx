import { Box, TextField } from "@mui/material";
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import MyComponent from "../components/MyComponent";
import { BASE_URL } from "../constants/constants";
import MinHeightTextarea from "@/components/MinHeightTextarea";
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';

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
        <p>Enter your name and a message and I will save it to my database!</p>
        <MyComponent></MyComponent>
        {data?.message ? <p>Server Fetch: {data.message}</p> : <p>No data</p>}
        <Box className="my-6">
          <TextField placeholder="First Name"></TextField>
          <TextField placeholder="Last Name"></TextField>
        </Box>
        <Box>
          <TextField
            id="outlined-multiline-flexible"
            label="Multiline"
            multiline
            maxRows={4}
            minRows={4}
          />
        </Box>
        <Box>
          <TextareaAutosize
            id="outlined-multiline-flexible"
            minRows={4}
            placeholder="message"
          />
        </Box>
        <MinHeightTextarea></MinHeightTextarea>
        <BaseTextareaAutosize aria-label="minimum height" minRows={3} placeholder="Minimum 3 rows" />
      </div>
    </main >
  );
}
