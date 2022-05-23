const express = require('express');
const checkAuth = require('../middleware/checkAuth.middleware');
const userControllers = require('../controllers/users.controllers');
const router = express.Router();

/**
 * @openapi
 * /v1/users/signin:
 *   post:
 *     description: Effettua la registrazione al negozio
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               nome:
 *                 type: string
 *               indirizzo:
 *                 type: object
 *                 properties:
 *                   via:
 *                     type: string
 *                   comune:
 *                     type: string
 *                   cap:
 *                     type: number
 *     responses:
 *       201:
 *         description: Ritorna l'indirizzo nell'header 'Location' per ottenere le info complete sull'utente appena creato.
 *       400:
 *         description: Password mancante o lunga meno di 8 caratteri
 *       403:
 *         description: Email già presente
 *       500:
 *         description: Errore interno del server
 */
 router.post('/signin', userControllers.userSignIn);

/**
 * @openapi
 * /v1/users/login:
 *   post:
 *     description: Effettua il login
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ritorna il nuovo token jwt, nome, id e mail utente.
 *       401:
 *         description: Email o password errati
 *       500:
 *         description: Errore interno del server
 */
 router.post('/login', userControllers.userLogin);

/**
 * @openapi
 * /v1/users/checkToken:
 *   get:
 *     description: Controlla validità del token e restituisce lo stesso token, nome utente, se utente è admin e id
 *     produces:
 *       - application/json
 *     security:
 *       - token: []
 *     responses:
 *       200:
 *         description: Ritorna le info dell'utente legate al token
 *       400:
 *         description: Token non valido o non presente
 */
router.get('/checkToken', checkAuth, userControllers.checkToken);

/**
 * @openapi
 * /v1/users/me:
 *   get:
 *     description: Ottiene tutte le info dell'utente!
 *     produces:
 *       - application/json
 *     security:
 *       - token: []
 *     responses:
 *       200:
 *         description: Ritorna tutte le info dell'utente.
 *       400:
 *         description: Token non valido, non presente o id utente non valido
 *       500:
 *         description: Errore interno del server
 */
router.get('/me', checkAuth, userControllers.getMe);

module.exports = router