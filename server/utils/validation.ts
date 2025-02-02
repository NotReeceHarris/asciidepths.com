import {
	RegExpMatcher,
	englishDataset,
	englishRecommendedTransformers,
} from 'obscenity';

const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});

import reserved_usernames from '../data/reserved_usernames.json';
import similarity from 'similarity';

export function validateEmail(email: string): boolean {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ) !== null;
};

export function validateUsername(username: string): { isValid: boolean; message?: string } {
    if (username.length < 3 || username.length > 20) {
        return { isValid: false, message: 'Username must be between 3 and 20 characters.' };
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
        return { isValid: false, message: 'Username must contain only letters and numbers.' };
    }

    if (reserved_usernames.some(rusername => similarity(username, rusername) > 0.75)) {
        return { isValid: false, message: 'Username is reserved.' };
    }

    if (matcher.hasMatch(username)) {
        return { isValid: false, message: 'Username contains inappropriate language.' };
    }

    return { isValid: true };
}