import express from 'express';
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { validateSessionPayload } from '../utils/session';

const router = express.Router();

router.post('/', async (req: Request, res: Response): Promise<any> => {

    const { session, username } = req.body;

    if (!session || !username) {
        return res.status(400).json({ success: false, errors: ['Invalid session.'] });
    }

    const user = await prisma.user.findUnique({
        where: { 
            username: username.trim()
        },
        select: { 
            id: true, 
            encryptionKey: true 
        },
    }).catch((error) => {
        return null
    })

    if (!user) {
        return res.status(400).json({ success: false, errors: ['Invalid session'] });
    }

    const valid = await validateSessionPayload(session, user.encryptionKey);

    if (!valid) {
        return res.status(400).json({ success: false, errors: ['Invalid session'] });
    }

    res.status(200).json({ success: true, username });
});

export default router;