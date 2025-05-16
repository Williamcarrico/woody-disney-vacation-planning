'use client';

import { firestore } from './firebase.config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export interface ContactFormData {
    name: string;
    email: string;
    message: string;
    createdAt?: any;
}

/**
 * Submit contact form data to Firebase
 * @param formData Form data to be submitted
 * @returns Promise with the submission result
 */
export async function submitContactForm(formData: ContactFormData): Promise<{ success: boolean; error?: string }> {
    try {
        // Validate form data
        if (!formData.name || !formData.email || !formData.message) {
            return {
                success: false,
                error: 'Please fill in all required fields'
            };
        }

        // Add timestamp
        const dataToSubmit = {
            ...formData,
            createdAt: serverTimestamp()
        };

        // Add to Firestore
        const contactsRef = collection(firestore, 'contacts');
        await addDoc(contactsRef, dataToSubmit);

        return {
            success: true
        };
    } catch (error) {
        console.error('Error submitting contact form:', error);
        return {
            success: false,
            error: 'An error occurred while submitting your message. Please try again later.'
        };
    }
}