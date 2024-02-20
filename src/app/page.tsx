// 'use client';
import { Container, Box, InputLabel, Input, FormHelperText, TextField } from '@mui/material';
import MyComponent from '../components/MyComponent';
import { BASE_URL } from '../constants/constants';
import { FormControl } from '@mui/material';

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
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <main>
          <div>
            <h1>Welcome to Jeff{'\u0027'}s Website!</h1>
            <p>We are currently under maintenance and will be up and running soon!</p>
            <MyComponent></MyComponent>
            {data?.message ? <p>Server Fetch: {data.message}</p> : <p>No data</p>}
          </div>
          <div className="my-6">
            <TextField
              id="firstName"
              label="First Name"
              placeholder="First Name"
              className="mr-4"
            />
            <TextField
              id="lastName"
              label="Last Name"
              placeholder="Last Name"
            />
          </div>
          <div>
            <TextField
              id="comment"
              label="Comment"
              multiline
              rows={4}
              placeholder="Comment"
            />
          </div>
        </main>
      </Box>
    </Container>
  )
}