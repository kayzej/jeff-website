"use client";
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';

const Navbar = () => {
  const handleResumeDownload = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    const link = document.createElement('a');
    link.href = '/Jeff_Kayzerman_Resume.pdf';
    link.download = 'Jeff_Kayzerman_Resume.pdf';
    link.click();
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'transparent', color: 'black', fontWeight: 'bold' }} elevation={0}>
      <Toolbar sx={{ color: 'black', fontWeight: 'bold' }}>
        {/* <VerticalNavBar /> */}
        <Box>
          <Button color="inherit" href="/">
            Home
          </Button>
          <Button color="inherit" href="/about">
            About
          </Button>
          <Button color="inherit" onClick={handleResumeDownload}>
            Resume
          </Button>
          <Button color="inherit" href="/test">
            Test
          </Button>
        </Box >
      </Toolbar >
    </AppBar >
  );
};

export default Navbar;