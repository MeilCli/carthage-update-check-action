import { toOutdatedPackages } from "../src/json";

test("parse", () => {
    const value = `*** Fetching RxSwift
The following dependencies are outdated:
RxSwift "4.5.0" -> "4.5.0" (Latest: "5.0.1")`

    const result = toOutdatedPackages(value);
    expect(result.length).toBe(1);

    expect(result[0].name).toBe("RxSwift");
    expect(result[0].current).toBe("4.5.0");
    expect(result[0].latest).toBe("5.0.1");
})