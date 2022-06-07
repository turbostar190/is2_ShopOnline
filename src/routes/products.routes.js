const express = require('express');
const productControllers = require('../controllers/products.controllers');
const checkAuth = require('../middleware/checkAuth.middleware')
const router = express.Router();
const multer = require('multer');

const fileSizeLimitErrorHandler = (err, req, res, next) => {
  if (err) {
    res.sendStatus(413).end();
  } else {
    next();
  }
}
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
var upload = multer({
  storage: storage,
  limits: {
    fileSize: 2000000
  }
});

/**
* @openapi
* /v2/products/categories:
*   get:
*     description: Ottiene tutte le categorie presenti
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Ritorna tutte le categorie presenti
*       500:
*         description: Errore interno.
*/
router.get('/categories', productControllers.getCategories);

/**
* @openapi
* /v2/products:
*   get:
*     description: Ottiene la lista dei prodotti
*     parameters:
*       - in: query
*         name: sort
*         schema:
*           type: string
*           enum: [name, cost]
*         description: Specifica in che modo ordinare i prodotti (nome o prezzo) 
*       - in: query
*         name: search
*         schema:
*           type: string
*         description: Specifica il nome del prodotti da ricercare. Confronto case insensitive e con uguale inizio di nome.
*       - in: query
*         name: category
*         schema:
*           type: string
*         description: Specifica la categoria di prodotti da restituire.
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
* /v2/products/{id}:
*   get:
*     description: Ottiene prodotto per id
*     produces:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         description: Id del prodotto
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Ottiene il prodotto che corrisponde ad uno specifico id.
*       400:
*         description: Id non valido.
*       404:
*         description: Prodotto non trovato.
*       500:
*         description: Errore interno.
*/
router.get('/:id', productControllers.getProductById);

/**
* @openapi
* /v2/products:
*   post:
*     description: Aggiunge un prodotto
*     produces:
*       - application/json
*     security:
*       - token: []
*     requestBody:
*       required: true
*       content:
*         multipart/form-data:
*           schema:
*             type: object
*             properties:
*               name:
*                 type: string
*                 required: true
*               description:
*                 type: string
*                 required: true
*               category:
*                 type: string
*                 required: true
*               cost:
*                 type: number
*                 required: true
*               img:
*                 type: file
*                 required: true
*     responses:
*       201:
*         description: Ritorna il percorso della risorsa creata nell'header 'location'.
*       400:
*         description: Parametri mancanti.
*       401:
*         description: Non autorizzato.
*       403:
*         description: Prodotto già presente.
*       500:
*         description: Errore interno.
*/
router.post('/', checkAuth, upload.single('img'), fileSizeLimitErrorHandler, productControllers.postProducts);

/**
* @openapi
* /v2/products/{id}:
*   put:
*     description: Modifica il prodotto corrispondente all'id passato.
*     produces:
*       - application/json
*     security:
*       - token: []
*     parameters:
*       - name: id
*         in: path
*         description: Id del prodotto
*         required: true
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         multipart/form-data:
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
*                 type: file
*     responses:
*       200:
*         description: Ritorna il prodotto con le informazioni aggiornate.
*       400:
*         description: Parametri mancanti.
*       401:
*         description: Non autorizzato.
*       404:
*         description: Prodotto non trovato.
*       500:
*         description: Errore interno.
*/
router.put('/:id', checkAuth, upload.single('img'), fileSizeLimitErrorHandler, productControllers.editProducts);


/**
* @openapi
* /v2/products/{id}:
*   delete:
*     description: Cancella il prodotto corrispondente all'id passato.
*     produces:
*       - application/json
*     security:
*       - token: []
*     parameters:
*       - name: id
*         in: path
*         description: Id del prodotto
*         required: true
*         schema:
*           type: string
*     responses:
*       204:
*         description: Conferma la cancellazione.
*       400:
*         description: Parametri mancanti.
*       401:
*         description: Non autorizzato.
*       404:
*         description: Prodotto non trovato.
*       500:
*         description: Errore interno.
*/
router.delete('/:id', checkAuth, productControllers.deleteProductById);

module.exports = router