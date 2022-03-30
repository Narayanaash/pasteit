import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { useRef, useState, useEffect } from 'react';
import Link from '@mui/material/Link';
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
import { Code } from '@mui/icons-material';

const fileTypes = ['JPG', 'PNG', 'GIF'];

const baseurl = 'https://pasteitt.netlify.app/';

const App = () => {
  const [urlText, setUrlText] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const [imgLongUrl, setImgLongUrl] = useState('');
  const [isCopiedvisible, setIsCopiedvisible] = useState(false);
  const [inputFile, setInputFile] = useState(null);

  let params = useParams();

  useEffect(() => {
    let urlcode = params.urlcode;

    if (urlcode) {
      fetchImgUrl(urlcode);
    }

    window.addEventListener('paste', onImgPaste);

    return () => {
      window.removeEventListener('paste', onImgPaste);
    };
  }, []);

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
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
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
    setInputFile(file);
    setUrlText('');
    setImgSrc('');
    setImgPrev(file);
  };

  return (
    <Box>
      <AppBar position="static" sx={{ backgroundColor: '#90caf9' }}>
        <Container maxWidth="md">
          <Toolbar variant="dense" disableGutters>
            <Link href="/">
              <img src="./logo.png" alt="" />
            </Link>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
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
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              sx={{
                height: '35px',
                ml: '10px',
                textTransform: 'none',
                lineHeight: 1,
              }}
            >
              Delete screenshot
            </Button>
          </Box>
          <Paper
            sx={{
              mt: 2,
              p: { xs: '10px', md: 5 },
              height: { xs: '80vw', md: '36vw' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className={`${urlText !== '' ? 'active imgBox' : 'imgBox'}`}
          >
            <Typography
              variant="h3"
              sx={{
                display: imgSrc === '' ? 'block' : 'none',
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
            <Link href={imgLongUrl} target="_blank" sx={{ height: '100%' }}>
              <img
                src={imgSrc}
                alt=""
                style={{
                  display: urlText !== '' ? 'block' : 'none',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              />
            </Link>
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
    </Box>
  );
};
export default App;
