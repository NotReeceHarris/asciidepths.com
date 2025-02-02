import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { validateSession } from '$lib/session';

export const load: PageServerLoad = async ({ cookies }) => {

    if (await validateSession(cookies)) {
        redirect(307, '/app');
    } else {
        redirect(307, '/auth');
    }

};