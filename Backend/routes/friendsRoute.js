const express = require('express');
const { searchAddFriend,AddFriend,getSentRequests,getReceivedRequests,acceptFriend ,declineFriend,cancelFriend,getAllFriends} = require('../controllers/addFriendController');

const verifyToken = require('../middleware/auth');
const router = express.Router();
router.get('/searchFriends',verifyToken,searchAddFriend);
router.post('/addFriend',verifyToken,AddFriend);
router.get('/getSentRequests',verifyToken,getSentRequests);
router.get('/getReceivedRequests',verifyToken,getReceivedRequests);
router.post('/acceptFriend',verifyToken,acceptFriend);
router.delete('/declineFriend',verifyToken,declineFriend);
router.delete('/cancelRequest',verifyToken,cancelFriend);
router.get('/getFriends',verifyToken,getAllFriends)
module.exports  = router;