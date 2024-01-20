'use client';

import { Modal, Overlay, createTheme } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'violet',
  defaultRadius: 'md',
  components: {
    Modal: Modal.extend({
      defaultProps: {
        centered: true,
      },
    }),
    Overlay: Overlay.extend({
      defaultProps: {
        opacity: 0.8,
        blur: 12,
      },
    }),
  },
});

export default theme;
