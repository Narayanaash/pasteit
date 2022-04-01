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
import Skeleton from '@mui/material/Skeleton';

export default function SavedImages() {
  const [userImageData, setUserImageData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let userId = localStorage.getItem('userId');
    if (userId) {
      fetchImgUrl(userId);
    } else {
      setIsLoading(false);
    }
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
    setIsLoading(false);
  };

  return (
    <Box>
      <Navbar />
      <Container maxWidth="md">
        <Grid container spacing={2} sx={{ mt: 2, mb: 5 }}>
          {isLoading
            ? [1, 2, 3, 4, 5, 6].map((item) => (
                <Grid item xs={12} sm={6} md={4}>
                  <Skeleton variant="rectangular" height={220} />
                  <Box sx={{ pt: 0.5 }}>
                    <Skeleton />
                    <Skeleton width="60%" />
                  </Box>
                </Grid>
              ))
            : userImageData.map((img) => (
                <Grid item xs={12} sm={6} md={4} key={img.urlcode}>
                  <Link to={`/${img.urlcode}`}>
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
                          {img.createdAt ? (
                            img.createdAt
                          ) : (
                            <i>Date not found!</i>
                          )}
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
