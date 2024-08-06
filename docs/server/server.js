const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 3000;

// Use a secure method to store and compare passwords
const hashedPassword = bcrypt.hashSync('1111', 10);  // Replace '1111' with your actual password

// Ensure the tmp directory exists
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
}

const upload = multer({ dest: 'tmp/' });

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 300000 }  // 5 minutes session timeout
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    const error = req.query.error || '';
    if (req.session.loggedin) {
        res.redirect('/dashboard');
    } else {
        res.render('index', { error });
    }
});

app.post('/auth', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    // Validate credentials
    if (username === 'admin' && bcrypt.compareSync(password, hashedPassword)) {  // Replace 'admin' with your actual username
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('/dashboard');
    } else {
        res.redirect('/?error=incorrect');
    }
});

app.get('/dashboard', (req, res) => {
    if (req.session.loggedin) {
        res.render('dashboard');
    } else {
        res.redirect('/');
    }
});

app.post('/upload', upload.array('files'), (req, res) => {
    const fileName = req.body.name;

    req.files.forEach(file => {
        handleFile(file, fileName);
    });
    res.status(200).json({ message: 'Files uploaded successfully' });
});

const handleFile = (file, fileName) => {
    if (!file) return;
    const oldPath = file.path;
    const ext = path.extname(file.originalname); // Get file extension
    const newPath = path.join(__dirname, 'uploads', `${fileName}${ext}`); // Ensure extension is added
    
    fs.rename(oldPath, newPath, err => {
        if (err) {
            console.error(`Error renaming file: ${err.message}`);
            return;
        }
        console.log(`File uploaded to ${newPath}`);
    });
};

app.get('/documents', async (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');
    try {
        const files = await fs.promises.readdir(directoryPath);
        const fileDetails = await Promise.all(files.map(async file => {
            const stats = await fs.promises.stat(path.join(directoryPath, file));
            return {
                name: file,
                size: `${(stats.size / 1024).toFixed(2)} KB`
            };
        }));

        res.json(fileDetails);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Unable to retrieve files or generate JSON');
    }
});


app.post('/delete', (req, res) => {
    console.log(req.body); // Log request body to debug

    const { fileName } = req.body;

    if (!fileName) {
        return res.status(400).json({ success: false, message: 'File name is required' });
    }

    const filePath = path.join(__dirname, 'uploads', fileName);

    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, async (err) => {
            if (err) {
                console.error(`Error deleting file: ${err.message}`);
                res.status(500).json({ success: false, message: 'Error deleting file' });
                return;
            }
            await saveJsonFile();
            res.json({ success: true, message: 'File deleted successfully' });
        });
    } else {
        res.status(404).json({ success: false, message: 'File not found' });
    }
});

app.post('/save-json', async (req, res) => {
    try {
        await saveJsonFile();
        res.json({ success: true, message: 'JSON file saved successfully' });
    } catch (err) {
        console.error('Error saving JSON file:', err);
        res.status(500).json({ success: false, message: 'Error saving JSON file' });
    }
});

app.get('/save-json', async (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');
    try {
        const files = await fs.promises.readdir(directoryPath);
        const fileDetails = await Promise.all(files.map(async file => {
            const stats = await fs.promises.stat(path.join(directoryPath, file));
            return {
                name: file,
                size: `${(stats.size / 1024).toFixed(2)} KB`
            };
        }));

        const jsonFilePath = path.join(__dirname, 'public', 'files.json');
        await fs.promises.writeFile(jsonFilePath, JSON.stringify(fileDetails, null, 2));
        console.log('JSON file saved successfully');
        res.json({ success: true });
    } catch (err) {
        console.error('Error saving JSON file:', err);
        res.status(500).json({ success: false, message: 'Unable to save JSON file' });
    }
});



const saveJsonFile = async () => {
    const directoryPath = path.join(__dirname, 'uploads');
    try {
        const files = await fs.promises.readdir(directoryPath);
        const fileDetails = await Promise.all(files.map(async file => {
            const stats = await fs.promises.stat(path.join(directoryPath, file));
            return {
                name: file,
                size: `${(stats.size / 1024).toFixed(2)} KB`
            };
        }));

        const jsonFilePath = path.join(__dirname, 'public', 'files.json');
        await fs.promises.writeFile(jsonFilePath, JSON.stringify(fileDetails, null, 2));
        console.log('JSON file saved successfully');
    } catch (err) {
        console.error('Error saving JSON file:', err);
    }
};



app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});
