import { Divider, Typography } from '@mui/material';

export default function Footer() {
  return (
    <>
      <Divider sx={{ pt: 2 }} />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ py: 2, textAlign: 'center' }}
      >
        © 2022 All rights reserved. PasteIt.
      </Typography>
    </>
  );
}
