const express = require('express');
const ordersControllers = require('../controllers/orders.controllers.js');
const checkAuth = require('../middleware/checkAuth.middleware');
const router = express.Router();
const router_v1 = express.Router();

/**
* @openapi
* /v2/orders/pending/:
*   get:
*     description: Ritorna gli ordini in attesa dell'utente, in caso di admin ritorna tutti gli ordini
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
*     description: Ritorna gli ordini completate dell'utente, in caso di admin ritorna tutti gli ordini
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

/**
* @openapi
* /v2/orders:
*   post:
*     description: Crea un ordine associata all'utente dato l'attuale carrello
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
* /v2/orders/approve/{id}:
*   patch:
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
*       403:
*         description: Operazione non permessa.
*       404:
*         description: Ordine non trovato.
*       500:
*         description: Errore interno.
*/
router.patch('/approve/:id', checkAuth, ordersControllers.approveOrder);

/**
* @openapi
* /v2/orders/not_approve/{id}:
*   patch:
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
*       403:
*         description: Operazione non permessa.
*       404:
*         description: Ordine non trovato.
*       500:
*         description: Errore interno.
*/
router.patch('/not_approve/:id', checkAuth, ordersControllers.notApproveOrder);

/**
* @openapi
* /v1/orders:
*   get:
*     deprecated: true
*     description: Ritorna gli ordini dell'utente, in caso di admin ritorna tutti gli ordini
*     produces:
*       - application/json
*     security:
*       - token: []
*     responses:
*       300:
*         description: Ritorna la lista dei nuovi url rest da interrogare.
*/
router_v1.get('/', checkAuth, ordersControllers.getOrders);

module.exports = { router, router_v1 };