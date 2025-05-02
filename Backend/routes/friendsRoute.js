const express = require('express');
const { searchAddFriend,AddFriend,getSentRequests,getReceivedRequests,acceptFriend ,declineFriend,cancelFriend,getAllFriends} = require('../controllers/addFriendController');

const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);
router.get('/searchFriends',searchAddFriend);
router.post('/addFriend',AddFriend);
router.get('/getSentRequests',getSentRequests);
router.get('/getReceivedRequests',getReceivedRequests);
router.post('/acceptFriend',acceptFriend);
router.delete('/declineFriend',declineFriend);
router.delete('/cancelRequest',cancelFriend);
router.get('/getFriends',getAllFriends)
module.exports  = router;