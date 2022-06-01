const express = require('express');
const ordersControllers = require('../controllers/orders.controllers.js');
const checkAuth = require('../middleware/checkAuth.middleware');
const router = express.Router();

/**
* @openapi
* /v1/orders:
*   post:
*     description: Crea un ordine associata all'utente
*     produces:
*       - application/json
*     security:
*       - token: []
*     responses:
*       201:
*         description: Ritorna il percorso della risorsa creata.
*       403:
*         description: Operazione non permessa, carrello vuoto.
*       500:
*         description: Errore interno.
*/
router.post('/', checkAuth, ordersControllers.postOrders);

/**
* @openapi
* /v1/orders/approve/:id:
*   put:
*     description: Approva un ordine in attesa
*     produces:
*       - application/json
*     security:
*       - token: []
*     parameters:
*       - name: id
*         in: path
*         description: Id dell'ordine
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Ritorna la risorsa aggiornata.
*       401:
*         description: Non autorizzato.
*       404:
*         description: Ordine non trovata.
*       500:
*         description: Errore interno.
*/
router.put('/approve/:id', checkAuth, ordersControllers.approveOrder);

/**
* @openapi
* /v1/orders/not_approve/:id:
*   put:
*     description: Non approva un ordine in attesa
*     produces:
*       - application/json
*     security:
*       - token: []
*     parameters:
*       - name: id
*         in: path
*         description: Id dell'ordine
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Ritorna la risorsa aggiornata.
*       401:
*         description: Non autorizzato.
*       404:
*         description: Ordine non trovata.
*       500:
*         description: Errore interno.
*/
router.put('/not_approve/:id', checkAuth, ordersControllers.notApproveOrder);

/**
* @openapi
* /v1/orders:
*   get:
*     description: Ritorna le ordinazioni dell'utente, in caso di admin ritorna tutte le ordinazioni
*     produces:
*       - application/json
*     security:
*       - token: []
*     responses:
*       200:
*         description: Ritorna la lista delle ordinazioni.
*       500:
*         description: Errore interno.
*/
router.get('/', checkAuth, ordersControllers.getOrders);

/**
* @openapi
* /v1/orders/pending/:
*   get:
*     description: Ritorna le ordinazioni in attesa dell'utente, in caso di admin ritorna tutte le ordinazioni
*     produces:
*       - application/json
*     security:
*       - token: []
*     responses:
*       200:
*         description: Ritorna la lista delle ordinazioni.
*       500:
*         description: Errore interno.
*/
router.get('/pending/', checkAuth, ordersControllers.getPendingOrders);

/**
* @openapi
* /v1/orders/completed/:
*   get:
*     description: Ritorna le ordinazioni completate dell'utente, in caso di admin ritorna tutte le ordinazioni
*     produces:
*       - application/json
*     security:
*       - token: []
*     responses:
*       200:
*         description: Ritorna la lista delle ordinazioni.
*       500:
*         description: Errore interno.
*/
router.get('/completed/', checkAuth, ordersControllers.getCompletedOrders);

module.exports = router;