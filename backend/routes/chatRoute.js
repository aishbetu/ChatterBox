const { getUsers, getMessages } = require("../controllers/chatController");
const { verifyToken } = require("../utils/middleware");

const router = require("express").Router();

router.get('/users', verifyToken, getUsers);
router.get('/messages/:userId', verifyToken, getMessages);

module.exports = router;