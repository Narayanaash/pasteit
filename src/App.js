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
import Resizer from 'react-image-file-resizer';

const App = () => {
  const [urlText, setUrlText] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const [isCopiedvisible, setIsCopiedvisible] = useState(false);

  useEffect(() => {
    const onImgPaste = (e) => {
      setImgPrev(e.clipboardData.files[0]);
      console.log(e.clipboardData.files[0]);
    };

    window.addEventListener('paste', onImgPaste);

    return () => {
      window.removeEventListener('paste', onImgPaste);
    };
  }, []);

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

    const fileName = new Date().getTime() + '.png';
    const storage = getStorage(app);
    const storageRef = ref(storage, fileName);
    file = await resizeFile(file);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Register three observers:
    // 1. 'state_changed' observer, called any time the state changes
    // 2. Error observer, called on failure
    // 3. Completion observer, called on successful completion
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log('Upload is ' + progress + '% done');
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
      (error) => {
        // Handle unsuccessful uploads
      },
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // console.log(downloadURL);
          setUrlText(downloadURL);
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

  return (
    <Box sx={{ backgroundColor: '#e3f2fd', height: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: '#90caf9' }}>
        <Container maxWidth="md">
          <Toolbar variant="dense" disableGutters>
            {/* <Typography variant="h5" noWrap component="div">
              PasteIt
            </Typography> */}
            <img src="./logo.png" alt="" />
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: urlText != '' ? 'flex' : 'none' }}>
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
              p: 5,
              height: '36vw',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className={`${urlText != '' ? 'active imgBox' : 'imgBox'}`}
          >
            <Typography
              variant="h3"
              sx={{
                display: imgSrc == '' ? 'block' : 'none',
                opacity: 0.4,
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              Press <strong>Ctrl+V</strong> to paste
              <br />a screenshot from the clipboard
            </Typography>
            <Link href={urlText} target="_blank" sx={{ height: '100%' }}>
              <img
                src={imgSrc}
                alt=""
                style={{
                  display: urlText != '' ? 'block' : 'none',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              />
            </Link>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};
export default App;
