'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { AppBar, Toolbar, Button, Box } from '@mui/material';

const Navbar = () => {
  const pathname = usePathname();
  const isTransparent = pathname === '/' || pathname === '/hobbies' || pathname === '/quickFacts';

  const handleResumeDownload = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    window.open(
      'Jeff Kayzerman Resume.pdf',
      // 'https://www.dropbox.com/scl/fi/m7z0yiap5q9l11piwsy2b/Jeff-Kayzerman-Resume.pdf?rlkey=r4llvg5kcbzbrrfupva0p3b5o&st=ec0f7cs4&dl=0',
      '_blank'
    );
  };

  const isHome = pathname === '/';

  const buttons = [
    { label: 'Home', href: '/' },
    { label: 'Hobbies', href: '/hobbies' },
    { label: 'Quick Facts', href: '/quickFacts' },
    ...(!isHome
      ? [
        // { label: 'Daily Log', href: '/dailyLog' },
        // { label: 'Daily Stats', href: '/dailyStats' },
        // { label: 'Markers Graph', href: '/markersGraph' },
        // { label: 'Markers Detail', href: '/markersDetail' },
        // { label: 'Journal', href: '/journal' },
        // { label: 'Insights', href: '/insights' },
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
