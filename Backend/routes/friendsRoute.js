import express from 'express';
import { 
  searchAddFriend,
  AddFriend,
  getSentRequests,
  getReceivedRequests,
  acceptFriend,
  declineFriend,
  cancelFriend,
  getAllFriends,
  removeFriend
} from '../controllers/addFriendController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/searchFriends', searchAddFriend);
router.post('/addFriend', AddFriend);
router.get('/getSentRequests', getSentRequests);
router.get('/getReceivedRequests', getReceivedRequests);
router.post('/acceptFriend', acceptFriend);
router.delete('/declineFriend', declineFriend);
router.delete('/cancelRequest', cancelFriend);
router.get('/getFriends', getAllFriends);
router.delete('/removeFriend', removeFriend);

export default router;