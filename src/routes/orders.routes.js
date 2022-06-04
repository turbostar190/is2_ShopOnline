const express = require('express');
const ordersControllers = require('../controllers/orders.controllers.js');
const checkAuth = require('../middleware/checkAuth.middleware');
const router = express.Router();
const router_v1 = express.Router();

/**
* @openapi
* /v2/orders:
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
* /v2/orders/approve/:id:
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
*       400:
*         description: Parametri scorretti.
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
* /v2/orders/not_approve/:id:
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
*       400:
*         description: Parametri scorretti.
*       401:
*         description: Non autorizzato.
*       404:
*         description: Ordine non trovata.
*       500:
*         description: Errore interno.
*/
router.put('/not_approve/:id', checkAuth, ordersControllers.notApproveOrder);

// TODO: Mantenere v1 per questo prossimo api endpoint
/**
* @openapi
* /v1/orders:
*   get:
*     deprecated: true
*     description: Ritorna le ordinazioni dell'utente, in caso di admin ritorna tutte le ordinazioni
*     produces:
*       - application/json
*     security:
*       - token: []
*     responses:
*       300:
*         description: Ritorna la lista dei nuovi url rest da interrogare.
*/
router_v1.get('/', checkAuth, ordersControllers.getOrders);

/**
* @openapi
* /v2/orders/pending/:
*   get:
*     description: Ritorna le ordinazioni in attesa dell'utente, in caso di admin ritorna tutte le ordinazioni
*     produces:
*       - application/json
*     security:
*       - token: []
*     responses:
*       200:
*         description: Ritorna la lista degli ordini in attesa.
*       500:
*         description: Errore interno.
*/
router.get('/pending/', checkAuth, ordersControllers.getPendingOrders);

/**
* @openapi
* /v2/orders/completed/:
*   get:
*     description: Ritorna le ordinazioni completate dell'utente, in caso di admin ritorna tutte le ordinazioni
*     produces:
*       - application/json
*     security:
*       - token: []
*     responses:
*       200:
*         description: Ritorna la lista degli ordini completati.
*       500:
*         description: Errore interno.
*/
router.get('/completed/', checkAuth, ordersControllers.getCompletedOrders);

module.exports = { router, router_v1 };