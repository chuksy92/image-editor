
export function isQuotaError(err: unknown) {
    return (
        err instanceof DOMException &&
        (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED")
    );
}

/**
 * createSafeLocalStorage:
 * - Wraps localStorage setItem to catch quota errors.
 * - Shows a human-friendly message when autosave cannot persist large payloads.
 */
export function createSafeLocalStorage() {
    return {
        getItem: (key: string) => localStorage.getItem(key),
        setItem: (key: string, value: string) => {
            try {
                localStorage.setItem(key, value);
            } catch (err) {
                if (isQuotaError(err)) {
                    alert(
                        [
                            "⚠️ Autosave paused",
                            "",
                            "This design is too large for your browser’s local storage so autosave was temporarily disabled.",
                            "",
                            "How to fix:",
                            "• Upload a smaller image or compress it",
                            "• Reduce the canvas size",
                            "• Remove unused layers",
                        ].join("\n")
                    );
                } else {
                    throw err;
                }
            }
        },
        removeItem: (key: string) => localStorage.removeItem(key),
    };
}
