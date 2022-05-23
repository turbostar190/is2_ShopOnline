const express = require('express');
const checkAuth = require('../middleware/checkAuth.middleware');
const cartControllers = require('../controllers/cart.controllers');
const router = express.Router();

/**
* @openapi
* /v1/cart:
*   get:
*     description: Ottiene il carrello dell'utente
*     produces:
*       - application/json
*     security:
*       - token: []
*     responses:
*       200:
*         description: Ritorna il carrello dell'utente.
*       500:
*         description: Errore interno.
*/
router.get('/', checkAuth, cartControllers.getCart);

/**
* @openapi
* /v1/cart/quantity:
*   get:
*     description: Ottiene il numero di prodotti nel carrello dell'utente
*     produces:
*       - application/json
*     security:
*       - token: []
*     responses:
*       200:
*         description: Ottiene il numero di prodotti nel carrello dell'utente.
*       500:
*         description: Errore interno.
*/
router.get('/quantity', checkAuth, cartControllers.getCartTotalQuantity);

/**
* @openapi
* /v1/cart:
*   post:
*     description: Aggiunge un elemento al carrello dell'utente oppure aggiorna la quantità se già presente
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
*               productId:
*                 type: string
*               quantity:
*                 type: number
*     responses:
*       200:
*         description: Ritorna un messaggio che indica la modifica della quantità
*       201:
*         description: Ritorna il percorso della risorsa creata.
*       500:
*         description: Errore interno.
*/
router.post('/', checkAuth, cartControllers.addElementToCart);

/**
* @openapi
* /v1/cart/:id:
*   patch:
*     description: Aggiorna un elemento presente nel carrello dell'utente
*     produces:
*       - application/json
*     security:
*       - token: []
*     parameters:
*       - name: id
*         in: path
*         description: Id dell'elemento del carrello
*         required: true
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         application/x-www-form-urlencoded:
*           schema:
*             type: object
*             properties:
*               productId:
*                 type: string
*               quantity:
*                 type: number
*     responses:
*       200:
*         description: Ritorna il carrello dell'utente.
*       400:
*         description: Parametri mancanti.
*       404:
*         description: Elemento non trovato.
*       500:
*         description: Errore interno.
*/
router.patch('/:id', checkAuth, cartControllers.updateElementFromCart);

/**
* @openapi
* /v1/cart/:id:
*   delete:
*     description: Cancella un elemento presente nel carrello dell'utente
*     produces:
*       - application/json
*     security:
*       - token: []
*     parameters:
*       - name: id
*         in: path
*         description: Id dell'elemento nel carrello
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Ritorna il carrello dell'utente.
*       400:
*         description: Parametri mancanti.
*       404:
*         description: Elemento non trovato.
*       500:
*         description: Errore interno.
*/
router.delete('/:id', checkAuth, cartControllers.deleteElementFromCart);

module.exports = router