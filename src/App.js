import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import { useState, useEffect } from 'react';
import './App.css';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import app from './firebase';
import { db } from './firebase';
import { addDoc, getDocs, collection, query, where } from 'firebase/firestore';
import Resizer from 'react-image-file-resizer';
import { FileUploader } from 'react-drag-drop-files';
import { useParams } from 'react-router-dom';
import Navbar from './comps/Navbar';
import Footer from './comps/Footer';
import { Add, AddBox } from '@mui/icons-material';

const fileTypes = ['JPG', 'PNG', 'GIF'];

const baseurl = 'https://pasteitt.netlify.app/';

const App = () => {
  const [urlText, setUrlText] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const [imgLongUrl, setImgLongUrl] = useState('');
  const [isCopiedvisible, setIsCopiedvisible] = useState(false);
  const [userId, setUserId] = useState('');

  let params = useParams();
  let urlcode = params.urlcode;

  useEffect(() => {
    if (urlcode) {
      fetchImgUrl(urlcode);
    }

    window.addEventListener('paste', onImgPaste);

    const newUserId = new Date().getTime() + Math.floor(Math.random() * 100000);
    let localUserId = localStorage.getItem('userId');
    if (!localUserId) {
      localStorage.setItem('userId', newUserId);
      setUserId(newUserId);
    } else {
      setUserId(localUserId);
    }

    return () => {
      window.removeEventListener('paste', onImgPaste);
    };
  }, [userId]);

  const fetchImgUrl = async (urlcode) => {
    const q = query(collection(db, 'urls'), where('urlcode', '==', urlcode));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setImgLongUrl(doc.data().url);
      setImgSrc(doc.data().url);
      setUrlText(baseurl + urlcode);
    });
  };

  const onImgPaste = (e) => {
    setUrlText('');
    setImgSrc('');
    setImgPrev(e.clipboardData.files[0]);
  };

  let storeUrl = async (url, urlCode) => {
    try {
      const docRef = await addDoc(collection(db, 'urls'), {
        url: url,
        urlcode: urlCode,
        userId: userId,
        createdAt: new Date().toDateString(),
      });
    } catch (e) {}
  };

  const resizeFile = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        1500,
        800,
        'JPEG',
        90,
        0,
        (uri) => {
          resolve(uri);
        },
        'file'
      );
    });

  let setImgPrev = async (file) => {
    const fileReader = new FileReader();

    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      setImgSrc(fileReader.result);
    };

    const fileName =
      new Date().getTime() + Math.floor(Math.random() * 10000) + '.png';
    const storage = getStorage(app);
    const storageRef = ref(storage, fileName);
    file = await resizeFile(file);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        switch (snapshot.state) {
          case 'paused':
            // console.log('Upload is paused');
            break;
          case 'running':
            // console.log('Upload is running');
            break;
          default:
        }
      },
      (error) => {},
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          let urlCode =
            new Date().getTime() + Math.floor(Math.random() * 10000);
          setImgLongUrl(downloadURL);
          setUrlText(baseurl + urlCode);
          storeUrl(downloadURL, urlCode.toString());
          window.history.replaceState(null, '', baseurl + urlCode);
        });
      }
    );
  };

  let handleUrlClick = (e) => {
    e.target.select();
    navigator.clipboard.writeText(urlText);
    setIsCopiedvisible(true);

    setTimeout(() => {
      setIsCopiedvisible(false);
    }, 3000);
  };

  const handleChange = (file) => {
    setUrlText('');
    setImgSrc('');
    setImgPrev(file);
  };

  return (
    <Box>
      <Navbar />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: urlText !== '' ? 'flex' : 'none' }}>
            <Box className="urlInputBox" sx={{ flexGrow: 1 }}>
              <input
                type="text"
                placeholder="URL of this page"
                readOnly
                value={urlText}
                className="urlInput"
                onSelect={handleUrlClick}
              />
              {isCopiedvisible && (
                <div className="urlCopiedAlert">Copied to clipboard</div>
              )}
            </Box>
            <a href="/">
              <Button
                variant="outlined"
                startIcon={<Add />}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  height: '35px',
                  ml: '10px',
                  textTransform: 'none',
                  lineHeight: 1,
                }}
              >
                New screenshot
              </Button>
              <IconButton
                aria-label="delete"
                color="primary"
                sx={{ display: { xs: 'block', md: 'none' } }}
              >
                <AddBox />
              </IconButton>
            </a>
          </Box>
          <Paper
            sx={{
              mt: 2,
              p: { xs: '10px', md: 5 },
              height: { xs: '80vw', md: '36vw' },
              display: { xs: imgSrc === '' ? 'none' : 'flex', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className={`${urlText !== '' ? 'active imgBox' : 'imgBox'}`}
          >
            <Typography
              variant="h3"
              sx={{
                display: { xs: 'none', md: imgSrc === '' ? 'block' : 'none' },
                opacity: 0.3,
                textAlign: 'center',
                lineHeight: 1.3,
                userSelect: 'none',
              }}
            >
              Press <strong>Ctrl+V</strong> to paste
              <br />a screenshot from the clipboard
            </Typography>
            {!urlText && imgSrc && <CircularProgress size="80px" />}
            <a href={imgLongUrl} target="_blank" style={{ height: '100%' }}>
              <img
                src={imgSrc}
                alt=""
                style={{
                  display: urlText !== '' ? 'block' : 'none',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              />
            </a>
          </Paper>
          <Typography
            variant="h5"
            component="div"
            sx={{
              display: { xs: 'none', md: 'block' },
              pt: 4,
              textAlign: 'center',
            }}
          >
            Or upload an image file from your computer:
          </Typography>
          <Box sx={{ pt: 3, pb: 5, display: 'flex', justifyContent: 'center' }}>
            <FileUploader
              handleChange={handleChange}
              name="file"
              types={fileTypes}
              maxSize="2"
              hoverTitle=" "
            >
              <Paper sx={{ width: { xs: '100%', md: 'initial' } }}>
                <Box
                  sx={{
                    display: { xs: 'block', md: 'flex' },
                    backgroundColor: '#fff',
                    borderRadius: '5px',
                    p: '10px',
                    width: { xs: '100%', md: '450px' },
                    maxWidth: '100%',
                  }}
                >
                  <Button
                    variant="contained"
                    component="label"
                    sx={{
                      px: 5,
                      textTransform: 'none',
                      backgroundColor: '#18629f',
                      display: 'block',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h5" component="span">
                      Browse...
                    </Typography>
                  </Button>
                  <Box
                    sx={{
                      display: { xs: 'none', md: 'initial' },
                      ml: 3,
                      color: '#919191',
                    }}
                  >
                    <Typography variant="h5" component="div">
                      Choose File
                    </Typography>
                    <Typography
                      component="p"
                      sx={{
                        mt: '-3px',
                        fontSize: '13px',
                      }}
                    >
                      (or drag and drop it)
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </FileUploader>
          </Box>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};
export default App;
