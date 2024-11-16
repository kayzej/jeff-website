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

  const buttons = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Resume', onClick: handleResumeDownload }, // Use onClick for the Resume button
    { label: 'Test', href: '/test' }
  ];

  return (
    <AppBar position="static" sx={{ backgroundColor: 'transparent', color: 'black', fontWeight: 'bold' }} elevation={0}>
      <Toolbar sx={{ color: 'black', fontWeight: 'bold' }}>
        <Box>
          {buttons.map((button, index) => (
            <Button
              key={index}
              color="inherit"
              href={button.href}
              onClick={button.onClick} // Only applies if the button has an onClick handler
              sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}
            >
              {button.label}
            </Button>
          ))}
        </Box>
      </Toolbar >
    </AppBar >
  );
};

export default Navbar;