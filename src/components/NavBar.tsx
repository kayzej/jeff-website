'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { AppBar, Toolbar, Button, Box } from '@mui/material';

const Navbar = () => {
  const pathname = usePathname();
  const isTransparent = pathname === '/' || pathname === '/about';

  const handleResumeDownload = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    window.open(
      'https://www.dropbox.com/scl/fi/3jttls4kaxjxj252jrwco/Jeff-Kayzerman-Resume-2026.pdf?rlkey=0ohvfydmp8zpbh1xxcxuqnha4&st=f2g5jsf4&dl=0',
      '_blank'
    );
  };

  const isHome = pathname === '/';

  const buttons = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    ...(!isHome
      ? [
          { label: 'Daily Log', href: '/dailyLog' },
          { label: 'Daily Stats', href: '/dailyStats' },
          { label: 'Markers Graph', href: '/markersGraph' },
          { label: 'Markers Detail', href: '/markersDetail' },
        ]
      : []),
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
