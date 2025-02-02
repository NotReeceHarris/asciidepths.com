import express from 'express';
import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import argon2 from 'argon2';
import { generateSessionPayload } from '../utils/session';
import prisma from '../utils/prisma';
import { validateEmail, validateUsername } from '../utils/validation';

const router = express.Router();

router.post('/', async (req: Request, res: Response): Promise<any> => {
    let { email, username, password } = req.body;
    username = username?.trim().toLowerCase();

    const errors: string[] = [];

    if (!email) errors.push('Email is required');
    if (!username) errors.push('Username is required');
    if (!password) errors.push('Password is required');

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ success: false, errors: ['Invalid email format.'] });
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
        return res.status(400).json({ success: false, errors: [usernameValidation.message] });
    }

    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
        select: { id: true, email: true, username: true },
    }).catch((error) => {
        return null
    })

    if (existingUser) {
        if (existingUser.email === email) errors.push('Email already in use.');
        if (existingUser.username === username) errors.push('Username already in use.');
        return res.status(400).json({ success: false, errors });
    }

    const user = await prisma.user.create({
        data: {
            email,
            username,
            password: await argon2.hash(password),
            encryptionKey: randomBytes(32).toString('hex'),
            location: {
                connect: {
                    name: 'stonestoryrpg.com'
                }
            },
            posx: 0,
            posy: 0,
        },
    }).catch((error) => {
        return null
    })

    if (!user) {

        await prisma.user.delete({
            where: { email }
        }).catch((error) => {
            return null
        })

        return res.status(500).json({ success: false, errors: ['Failed to create user.'] });
    }

    const session = await generateSessionPayload(user.id);
    res.status(200).json({ success: true, session, username: user.username });
});

export default router;