import { Box, Container, Grid } from '@mui/material';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Navbar from '../comps/Navbar';
import { Link } from 'react-router-dom';
import Footer from '../comps/Footer';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useEffect, useState } from 'react';

export default function SavedImages() {
  const [userImageData, setUserImageData] = useState([]);

  useEffect(() => {
    let userId = localStorage.getItem('userId');
    fetchImgUrl(userId);
  }, []);

  const fetchImgUrl = async (userId) => {
    const q = query(
      collection(db, 'urls'),
      where('userId', '==', userId.toString())
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setUserImageData((prevData) => [doc.data(), ...prevData]);
    });
  };

  return (
    <Box>
      <Navbar />
      <Container maxWidth="md">
        <Grid container spacing={2} sx={{ mt: 2, mb: 5 }}>
          {userImageData.map((img) => (
            <Grid item xs={12} sm={6} md={4} key={img.urlcode}>
              <Link to="/322323">
                <Card sx={{ maxWidth: 345 }} className="savedCard">
                  <CardMedia
                    component="img"
                    height="220"
                    image={img.url}
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
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}
