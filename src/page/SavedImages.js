import { Box, Container, Grid } from '@mui/material';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Navbar from '../comps/Navbar';
import { Link } from 'react-router-dom';
import Footer from '../comps/Footer';

const baseurl = 'https://pasteitt.netlify.app/';

export default function SavedImages() {
  return (
    <Box>
      <Navbar />
      <Container maxWidth="md">
        <Grid container spacing={2} sx={{ mt: 2, mb: 5 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
            <Grid item xs={12} sm={6} md={4}>
              <a href={baseurl}>
                <Card sx={{ maxWidth: 345 }} className="savedCard">
                  <CardMedia
                    component="img"
                    height="220"
                    image="https://via.placeholder.com/400.png/"
                    alt=""
                    sx={{ p: '10px' }}
                  />
                  <CardActions>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ pb: 0.8, pl: '3px' }}
                    >
                      September 14, 2016
                    </Typography>
                  </CardActions>
                </Card>
              </a>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}
