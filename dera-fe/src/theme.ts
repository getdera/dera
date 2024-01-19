'use client';

import { Overlay, createTheme } from '@mantine/core';

const theme = createTheme({
  defaultRadius: 'md',
  components: {
    Overlay: Overlay.extend({
      defaultProps: {
        opacity: 0.4,
        blur: 8,
      },
    }),
  },
});

export default theme;
