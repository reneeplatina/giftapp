/** A household — even a big one — has a small, known number of kids to
 * manage. Capping it keeps runaway creation (each one provisions a real
 * synthetic auth user) from turning into an abuse vector. Shared between
 * the server action that enforces it and the client UI that reflects it,
 * so it lives outside both the "use server" and "server-only" files. */
export const MAX_MANAGED_PROFILES = 5;
