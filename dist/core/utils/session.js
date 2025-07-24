export const removeExpiredSessions = (sessions) => {
    const now = new Date();
    return sessions.filter(({ expiresAt }) => {
        const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
        return expiry > now;
    });
};
//# sourceMappingURL=session.js.map