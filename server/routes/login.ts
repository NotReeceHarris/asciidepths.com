import express from 'express';
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { validateEmail } from '../utils/validation';
import { generateSessionPayload } from '../utils/session';
import argon2 from 'argon2';

const router = express.Router();

router.post('/', async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, errors: ['Incorrect email or password.'] });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ success: false, errors: ['Invalid email format.'] });
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, username: true, password: true },
    }).catch((error) => {
        return null
    })

    if (!user || !(await argon2.verify(user.password, password))) {
        return res.status(400).json({ success: false, errors: ['Incorrect email or password.'] });
    }

    const session = await generateSessionPayload(user.id);
    res.status(200).json({ success: true, session, username: user.username });
});

export default router;