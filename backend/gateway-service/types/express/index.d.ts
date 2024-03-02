declare namespace Express {
    export interface Request {
      user?: any; // Ideally, replace 'any' with a more specific type for your user object
    }
}