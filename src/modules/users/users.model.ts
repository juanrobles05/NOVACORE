// Example user data model used across the users module
export interface User {
  id: number;
  id_document: string;
  username: string;
  email: string;
  password?: string; // Optional for security reasons
}