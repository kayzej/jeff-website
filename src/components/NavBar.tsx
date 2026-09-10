'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { AppBar, Toolbar, Button, Box } from '@mui/material';

const Navbar = () => {
  const pathname = usePathname();
  const isTransparent =
    pathname === '/' || pathname === '/hobbies' || pathname === '/quickFacts' || pathname === '/aboutSite';

  const handleResumeDownload = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    window.open('Jeff Kayzerman Resume.pdf', '_blank');
  };

  const buttons = [
    { label: 'Home', href: '/' },
    { label: 'Quick Facts', href: '/quickFacts' },
    { label: 'Hobbies', href: '/hobbies' },
    { label: 'About This Site', href: '/aboutSite' },
    { label: 'Resume', onClick: handleResumeDownload },
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
