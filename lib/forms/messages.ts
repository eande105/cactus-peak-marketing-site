// Shared by the server actions and the client forms. A "use server" module can export only async functions,
// so the text lives here. Every form error names a way to recover.
export const NETWORK_ERROR =
  "We could not send that. Check your connection and try again, or call (480) 555-0100."
export const JOIN_NETWORK_ERROR =
  "We could not start your membership. Check your connection and try again, or call (480) 555-0100."
