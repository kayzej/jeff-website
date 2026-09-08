'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { AppBar, Toolbar, Button, Box } from '@mui/material';

const Navbar = () => {
  const pathname = usePathname();
<<<<<<< Updated upstream
  const isTransparent = pathname === '/' || pathname === '/about';
=======
  const isTransparent =
    pathname === '/' ||
    pathname === '/hobbies' ||
    pathname === '/quickFacts' ||
    pathname === '/3dPrints' ||
    pathname === '/aboutSite';
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
    { label: 'About', href: '/about' },
=======
    { label: 'Hobbies', href: '/hobbies' },
    { label: 'Quick Facts', href: '/quickFacts' },
    { label: '3D Prints', href: '/3dPrints' },
    { label: 'About This Site', href: '/aboutSite' },
>>>>>>> Stashed changes
    ...(!isHome
      ? [
          { label: 'Daily Log', href: '/dailyLog' },
          { label: 'Daily Stats', href: '/dailyStats' },
          { label: 'Markers Graph', href: '/markersGraph' },
          { label: 'Markers Detail', href: '/markersDetail' },
          { label: 'Journal', href: '/journal' },
          { label: 'Insights', href: '/insights' },
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
