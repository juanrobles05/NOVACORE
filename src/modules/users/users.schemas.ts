import { z } from 'zod';

// User schema definition
export const UserSchema = z.object({
    id: z.number().int().positive().describe('Unique identifier for the user'),
    id_document: z.string().min(5).max(20).describe('Identification document of the user'),
    username: z.string().min(3).max(50).describe('Username of the user'),
    email: z.email().describe('Email address of the user'),
    createdAt: z.iso.datetime().describe('Timestamp when the user was created'),
});

// Schema for creating a new user
export const CreateUserBodySchema = z.object({
    id_document: z.string().min(5).max(20).describe('Identification document of the user'),
    username: z.string().min(3, 'Username must be at least 3 characters.').max(50).describe('Username of the user'),
    email: z.email().describe('Email address of the user'),
    password: z.string().min(6, 'Password must be at least 6 characters.').describe('Password for the user account'),
});

// Array schema for multiple users
export const UserArraySchema = z.array(UserSchema);

// Standardized error response schema
export const ErrorResponseSchema = z.object({
    status: z.literal('error'),
    error: z.string().describe('Error message'),
    message: z.string().optional().describe('Optional detailed error message'),
});

// TypeScript types inferred from schemas
export type UserType = z.infer<typeof UserSchema>;
export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>;