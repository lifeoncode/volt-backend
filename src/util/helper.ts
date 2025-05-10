export const resolveErrorType = (errorMessage: string): number => {
    if (errorMessage.includes("missing") || errorMessage.includes("invalid")) {
        return 400
    }
    return 500;
}