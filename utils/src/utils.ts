export function toLower(v: string) {
    return v.toLowerCase();
}

export function formatFutureDate(dateNum: number) {
    const date = new Date(dateNum);

    // within 1 minute from Date.now()
    if (date.getTime() - Date.now() <= 60000) {
        return `${Math.floor((date.getTime() - Date.now()) / 1000)}s`;
    }

    // within 1 hour from Date.now()
    if (date.getTime() - Date.now() <= 3600000) {
        return `${Math.floor((date.getTime() - Date.now()) / 60000)}m`;
    }

    // within 1 day from Date.now()
    if (date.getTime() - Date.now() <= 86400000) {
        return `${Math.floor((date.getTime() - Date.now()) / 3600000)}h`;
    }

    // within 1 week from Date.now()
    if (date.getTime() - Date.now() <= 604800000) {
        return `${Math.floor((date.getTime() - Date.now()) / 86400000)}d`;
    }

    // show date
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export function formatPreviousDate(dateNum: number) {
    const date = new Date(dateNum);

    // within 1 minute from Date.now()
    if (Date.now() - date.getTime() <= 60000) {
        return "now";
    }

    // within 1 hour from Date.now()
    if (Date.now() - date.getTime() <= 3600000) {
        return `${Math.floor((Date.now() - date.getTime()) / 60000)}m ago`;
    }

    // within 1 day from Date.now()
    if (Date.now() - date.getTime() <= 86400000) {
        return `${Math.floor((Date.now() - date.getTime()) / 3600000)}h ago`;
    }

    // within 1 week from Date.now()
    if (Date.now() - date.getTime() <= 604800000) {
        return `${Math.floor((Date.now() - date.getTime()) / 86400000)}d ago`;
    }

    // show date
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export const getPoints = (word: string): number => {
    switch (word.length) {
        case 3:
            return 100;
        case 4:
            return 400;
        case 5:
            return 800;
        case 6:
            return 1400;
        case 7:
            return 1800;
        case 8:
            return 2200;
        default:
            if (word.length > 8) {
                return 400 * word.length - 1000;
            }

            return 0;
    }
};
