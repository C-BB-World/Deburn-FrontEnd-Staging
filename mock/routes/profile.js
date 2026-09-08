import { Router } from 'express';
import multer from 'multer';
import * as state from '../state.js';
import { successResponse, requireAuth } from '../helpers.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.put('/profile', (req, res) => {
  const user = requireAuth(req);
  const { firstName, lastName, organization, role, bio } = req.body || {};
  res.json(
    successResponse({
      user: {
        id: user.id,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        email: user.email,
        organization: organization || user.profile?.organization,
        role: role || user.profile?.jobTitle,
        bio: bio || 'Passionate about building great teams',
      },
    })
  );
});

router.post('/profile/avatar', upload.single('avatar'), (req, res) => {
  const user = requireAuth(req);
  res.json(successResponse({ avatarUrl: `/uploads/avatars/${user.id}.jpg` }));
});

router.put('/profile/avatar', (req, res) => {
  requireAuth(req);
  res.json(successResponse(null));
});

router.delete('/conversations', (req, res) => {
  requireAuth(req);
  const count = state.conversations.size;
  state.conversations.clear();
  res.json(successResponse({ deleted: true, deletedCount: count }));
});

export default router;
