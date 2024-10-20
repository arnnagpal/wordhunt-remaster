export function toLower(v: string) {
    return v.toLowerCase();
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
