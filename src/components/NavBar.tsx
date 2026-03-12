'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { AppBar, Toolbar, Button, Box } from '@mui/material';

const Navbar = () => {
  const pathname = usePathname();
  const isTransparent = pathname === '/' || pathname === '/about';

  const handleResumeDownload = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const link = document.createElement('a');
    link.href = '/Jeff_Kayzerman_Resume.pdf';
    link.download = 'Jeff_Kayzerman_Resume.pdf';
    link.click();
  };

  const buttons = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Daily Log', href: '/dailyLog' },
    { label: 'Daily Stats', href: '/dailyStats' },
    { label: 'Markers Graph', href: '/markersGraph' },
    { label: 'Markers Detail', href: '/markersDetail' },
    { label: 'Resume', onClick: handleResumeDownload }, // Use onClick for the Resume button
  ];

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: isTransparent ? 'transparent' : '#212529', color: 'white', fontWeight: 'bold' }}
      elevation={0}
    >
      <Toolbar sx={{ color: 'white', fontWeight: 'bold', justifyContent: 'center' }}>
        <Box>
          {buttons.map((button, index) => (
            <Button
              key={index}
              color="inherit"
              href={button.href}
              onClick={button.onClick}
              sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}
            >
              {button.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
