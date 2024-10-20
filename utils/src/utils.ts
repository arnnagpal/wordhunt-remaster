export function toLower(v: string) {
    return v.toLowerCase();
}

export const asyncInterval = async (
    callback: any,
    ms = 250,
    triesLeft = -1
) => {
    return new Promise((resolve, reject) => {
        const handleInterval = () => {
            triesLeft--;
            const result = callback();
            if (result) {
                resolve(result);
                clearInterval(interval);
            } else if (triesLeft < 1 && triesLeft !== -1) {
                reject(new Error("Failed"));
                clearInterval(interval);
            }
        };

        const interval = setInterval(handleInterval, ms);
    });
};

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
