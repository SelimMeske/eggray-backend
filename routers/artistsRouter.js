const express = require('express');
const router = express.Router();
const db = require('mysql');
const multer = require('multer');

MIME_TYPE_MAP = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png' : 'png'
}

let config = multer.diskStorage({
    
    destination: (req, file, cb) => {
        let error = null;
        if(!MIME_TYPE_MAP[file.mimetype]){
            error = new Error('Wrong mime-type');
        }
        cb(error, 'images')
    },
    
    filename: (req, file, cb) => {
        let ext = MIME_TYPE_MAP[file.mimetype];
        let name = file.originalname.toLocaleLowerCase().split(' ').join('-');
        cb(null, name + '-' + Date.now() + '.' + ext)
    }
})

const connection = db.createConnection({
    database: 'eggray',
    user: 'mesic',
    password: 'tibor123',
    host: 'localhost'
});

connection.connect(error => {
    if(error) throw error;
    console.log('Database connected.')
});

router.post('', multer({storage: config}).array('image'), (req, res, next) => { 

    let postIsDraft = false;

    if(req.body.draft === '1'){
        postIsDraft = true;
    }
    
    const command = 'INSERT INTO artists SET name = ?, content = ?, image = ?, post_image = ?, autor = ?, draft = ?';
    const commandGetAdmin = 'SELECT ID FROM admins WHERE name = ?';

    connection.query(commandGetAdmin, req.body.autor, (err, response) => {
        if (err) throw err;

        let artist = {
            name: req.body.name,
            content: req.body.content,
            image: req.protocol + '://' + req.get('host') + '/images/'+ req.files[0].filename,
            post_image: req.protocol + '://' + req.get('host') + '/images/' + req.files[1].filename,
            autor: response[0].ID,
            draft: postIsDraft
        }

        connection.query(command, [artist.name, artist.content, artist.image, artist.post_image, artist.autor, artist.draft], (err, response) => {
            if(err) throw err;
    
            res.status(200).json({
                message: 'Artist successfully created'
            })
        });

    });

    
}); 

router.put('/:id', multer({storage: config}).array('image'), (req, res, next) => {
    
    let message = 'Post successfully updated.'
    let id = req.params.id;

    let image = req.body.image
    let post_image = req.body.post_image

    if(req.files[0] && req.files[1]){
        image = req.protocol + '://' + req.get('host') + '/images/' + req.files[0].filename
        post_image = req.protocol + '://' + req.get('host') + '/images/' + req.files[1].filename
    }else if(req.files[0]){
        image = req.protocol + '://' + req.get('host') + '/images/' + req.files[0].filename
    }else if(req.files[1]){
        post_image = req.protocol + '://' + req.get('host') + '/images/' + req.files[1].filename
    }

    let artist = {
        name: req.body.name,
        content: req.body.content,
        image: image,
        post_image: post_image,
        draft: req.body.draft
    }

    const command = 'UPDATE artists SET name = ?, content = ?, image = ?, post_image = ?, draft = ? WHERE id = ?';

    connection.query(command, [artist.name, artist.content, artist.image, artist.post_image, artist.draft, id], (err, response) => {
        if(err) throw err;

        res.status(200).json({
            message: message
        })
    });


});

router.get('/', (req, res, next) => {
    
    const command = 'SELECT * FROM artists';
    const autors = 'SELECT * FROM admins';

    connection.query(autors, (err, response) => {

        if(err) throw err;

        let autors = response;

        connection.query(command, (err, response) => {
            
            if(err) throw err;

            let posts = response;
        
            let setAutor = posts.map(post => {

                let findAutor = autors.find(autor => autor.id === post.autor);

                post.autor = findAutor.name;

                if(post.draft === 1){
                    post.draft = 'Draft'
                }else{
                    post.draft = 'Published'
                }

                return post;
            });
            
            res.status(200).json(setAutor);
        })
    });
});

router.get('/:id', (req, res, next) => {
    
    let id = req.params.id;

    let command = 'SELECT * FROM artists WHERE id = ?';

    connection.query(command, id, (err, response) => {
        
        if(err) throw err;

        let post = response[0];

        if(post.draft === 1){
            post.draft = 'Draft'
        }else{
            post.draft = 'Published'
        }

        res.status(200).json(
            post
        )
    });

});

router.delete('/:id', (req, res, next) => {

    let deleteID = req.params.id;
    console.log(deleteID)

    const command = 'DELETE FROM artists WHERE ID = ?';

    connection.query(command, deleteID, (err, response) => {
        
        if(err) throw err;

        res.status(200).json({message: 'Successfully deleted post.'});
    }); 
});

module.exports = router;