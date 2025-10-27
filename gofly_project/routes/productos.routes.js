const router = require('express').Router();
const ctrl = require('../controllers/productos.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', auth, ctrl.create);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
