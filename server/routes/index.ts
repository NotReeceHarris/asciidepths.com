import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

router.get('/', (_: Request, res: Response) => {
    res.json({ online: true });
});

export default router;