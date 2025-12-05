const express = require('express');
const router = express.Router();

const authController = require('../controllers/AuthController');
const eleicoesController = require('../controllers/eleicoesController');
const tarefaController = require('../controllers/tarefaController');
const dashboardController = require('../controllers/DashboardController');
const contatoController = require('../controllers/contatoController');
const acaoController = require('../controllers/acaoController');
const chatbotController = require('../controllers/chatbotController');
const userController = require('../controllers/userController');
const financeiroController = require('../controllers/financeiroController');
const municipioController = require('../controllers/municipioController');

const { ensureAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

router.post('/login', authController.login);

// --- ROTAS PROTEGIDAS ---
router.use(ensureAuthenticated);

// Rotas do Dashboard
router.get('/dashboard/stats', dashboardController.getDashboardStats);
router.get('/dashboard/summary', dashboardController.getReportSummary);

// Rotas de Entidades
router.get('/eleicoes', eleicoesController.getAllEleicoes);
router.get('/eleicoes/stats', eleicoesController.getEleicaoStats);

router.post('/tarefas', tarefaController.createTarefa);
router.get('/tarefas', tarefaController.getAllTarefas);
router.get('/tarefas/:id', tarefaController.getTarefaById);
router.put('/tarefas/:id', tarefaController.updateTarefa);
router.delete('/tarefas/:id', tarefaController.deleteTarefa);

router.get('/contatos', contatoController.getAllContatos);
router.post('/contatos', contatoController.createContato);
router.put('/contatos/:id', contatoController.updateContato);
router.delete('/contatos/:id', isAdmin, contatoController.deleteContato);

router.get('/acoes', acaoController.findAll);
router.post('/acoes', acaoController.create);
router.put('/acoes/:id', acaoController.update);
router.delete('/acoes/:id', acaoController.delete);

router.get('/financeiro', financeiroController.findAll);
router.post('/financeiro', financeiroController.create);

router.get('/municipios', municipioController.findAll);
router.get('/municipios/:municipioId/bairros', municipioController.findBairrosByMunicipio);

// --- CONFIGURAÇÕES DE PERFIL ---
router.get('/config/profile', userController.getProfile);
router.put('/config/profile', userController.updateProfile);
router.post('/profile/change-password', userController.changePassword);

// --- GESTÃO DE USUÁRIOS ---
router.post('/users', isAdmin, userController.create);
router.get('/users', ensureAuthenticated, userController.findAll);
router.put('/users/:id', isAdmin, userController.update);
router.delete('/users/:id', isAdmin, userController.delete);

// --- CHATBOT ---
router.post('/chatbot', ensureAuthenticated, chatbotController.chat);

module.exports = router;

// Fix Vercel Case Sensitivity.