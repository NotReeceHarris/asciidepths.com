import {
    RegExpMatcher,
    englishDataset,
    englishRecommendedTransformers,
} from 'obscenity';
import reservedUsernames from './reserved_usernames.json';
import similarity from 'similarity';

// Initialize the obscenity matcher once (reusable)
const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
});

// Email validation regex (pre-compiled for better performance)
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Username validation regex (pre-compiled for better performance)
const USERNAME_REGEX = /^[a-zA-Z0-9]+$/;

// Threshold for similarity checks
const SIMILARITY_THRESHOLD = 0.75;

// Username length constraints
const MAX_USERNAME_LENGTH = 20;
const MIN_USERNAME_LENGTH = 3;

/**
 * Validates an email address.
 * @param email - The email address to validate.
 * @returns Whether the email is valid.
 */
export function validateEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
}

/**
 * Validates a username.
 * @param username - The username to validate.
 * @returns An object indicating whether the username is valid and an optional error message.
 */
export function validateUsername(username: string): { isValid: boolean; message?: string } {
    // Check length
    if (username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH) {
        return { isValid: false, message: 'Username must be between 3 and 20 characters.' };
    }

    // Check allowed characters
    if (!USERNAME_REGEX.test(username)) {
        return { isValid: false, message: 'Username must contain only letters and numbers.' };
    }

    // Check against reserved usernames
    if (reservedUsernames.some(reserved => similarity(username, reserved) > SIMILARITY_THRESHOLD)) {
        return { isValid: false, message: 'Username is reserved.' };
    }

    // Check for inappropriate language
    if (matcher.hasMatch(username)) {
        return { isValid: false, message: 'Username contains inappropriate language.' };
    }

    return { isValid: true };
}