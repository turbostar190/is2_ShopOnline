const express = require('express');
const productControllers = require('../controllers/products.controllers');
const checkAuth = require('../middleware/checkAuth.middleware')
const router = express.Router();
const multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

var upload = multer({ storage: storage });

/**
* @openapi
* /v1/products:
*   get:
*     description: Ottiene la lista dei prodotti
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Ottiene la lista dei prodotti.
*       500:
*         description: Errore interno.
*/
router.get('/', productControllers.getProducts);

/**
* @openapi
* /v1/products/:id:
*   get:
*     description: Ottiene prodotto per id
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Ottiene il prodotto che corrisponde all'id passato.
*       404:
*         description: Prodotto non trovato.
*       500:
*         description: Errore interno.
*/
router.get('/:id', productControllers.getProductById);

/**
* @openapi
* /v1/products:
*   post:
*     description: Aggiunge un prodotto
*     produces:
*       - application/json
*     security:
*       - token: []
*     requestBody:
*       required: true
*       content:
*         application/x-www-form-urlencoded:
*           schema:
*             type: object
*             properties:
*               name:
*                 type: string
*               description:
*                 type: string
*               category:
*                 type: string
*               cost:
*                 type: number
*               img:
*                 type: string
*     responses:
*       201:
*         description: Ritorna il percorso della risorsa creata.
*       400:
*         description: Parametri mancanti.
*       401:
*         description: Non autorizzato.
*       500:
*         description: Errore interno.
*/
router.post('/', checkAuth, upload.single('img'), productControllers.postProducts);

/**
* @openapi
* /v1/products/:id:
*   put:
*     description: Modifica il prodotto corrispondente all'id passato.
*     produces:
*       - application/json
*     security:
*       - token: []
*     requestBody:
*       required: true
*       content:
*         application/x-www-form-urlencoded:
*           schema:
*             type: object
*             properties:
*               name:
*                 type: string
*               description:
*                 type: string
*               category:
*                 type: string
*               cost:
*                 type: number
*               img:
*                 type: string
*     responses:
*       200:
*         description: Ottiene il prodotto che corrisponde all'id passato.
*       400:
*         description: Parametri mancanti.
*       401:
*         description: Non autorizzato.
*       404:
*         description: Prodotto non trovato.
*       500:
*         description: Errore interno.
*/
router.put('/:id', checkAuth, upload.single('img'), productControllers.editProducts);

module.exports = router