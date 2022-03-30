import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#90caf9' }}>
      <Container maxWidth="md">
        <Toolbar variant="dense" disableGutters>
          <a href="/">
            <img src="./logo.png" alt="" />
          </a>
          <Link
            to="/saved"
            style={{
              textDecoration: 'none',
              color: 'white',
              marginLeft: 'auto',
            }}
          >
            <Button
              variant="text"
              sx={{ color: 'white', textTransform: 'none' }}
            >
              Saved Screenshots
            </Button>
          </Link>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
