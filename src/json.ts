export interface OutdatedPackage {
    readonly name: string;
    readonly current: string;
    readonly latest: string;
}

export function toOutdatedPackages(value: string): OutdatedPackage[] {
    const lines = value.split("\n").map(x => x.trim());
    const result: OutdatedPackage[] = [];

    for (const line of lines) {
        if (line.length == 0) {
            continue;
        }

        const match = line.match(
            /(.+?)\s"(.+?)"\s->\s"(.+?)"\s\(Latest:\s"(.+?)"\)/
        );
        if (match == null) {
            continue;
        }
        if (match.length != 5) {
            continue;
        }

        const name = match[1];
        const current = match[2];
        const latest = match[4];

        result.push({
            name: name,
            current: current,
            latest: latest
        });
    }

    return result;
}
