import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as io from "@actions/io";
import * as os from "os";
import { ExecOptions } from "@actions/exec/lib/interfaces";
import { OutdatedPackage, toOutdatedPackages } from "./json";

interface Option {
    readonly executeDirectories: string[] | null;
}

async function getOption(): Promise<Option> {
    let executeDirectories: string[] | null = core
        .getInput("execute_directories")
        .split(os.EOL)
        .map((x) => x.trim());
    if (executeDirectories.length == 1 && executeDirectories[0].length == 0) {
        executeDirectories = null;
    }

    return {
        executeDirectories: executeDirectories,
    };
}

async function checkEnvironment() {
    await io.which("carthage", true);
}

async function executeOutdated(executeDirectory: string | null): Promise<OutdatedPackage[]> {
    const execOption: ExecOptions = {};
    if (executeDirectory != null) {
        execOption.cwd = executeDirectory;
    }

    let stdout = "";
    execOption.listeners = {
        stdout: (data: Buffer) => {
            stdout += data.toString();
        },
    };

    await exec.exec("carthage outdated", undefined, execOption);

    return toOutdatedPackages(stdout);
}

function convertToOutputText(outdatedPackages: OutdatedPackage[]): string {
    let result = "";
    for (const outdatedPackage of outdatedPackages) {
        if (0 < result.length) {
            result += os.EOL;
        }
        result += `${outdatedPackage.name}: new version ${outdatedPackage.latest}`;
    }
    return result;
}

async function run() {
    try {
        await checkEnvironment();
        const option = await getOption();

        const result: OutdatedPackage[] = [];
        if (option.executeDirectories == null) {
            const packages = await executeOutdated(null);
            packages.forEach((x) => result.push(x));
        } else {
            for (const executeDirectory of option.executeDirectories) {
                const packages = await executeOutdated(executeDirectory);
                packages.forEach((x) => result.push(x));
            }
        }

        const outputText = convertToOutputText(result);
        core.setOutput("has_carthage_update", result.length == 0 ? "false" : "true");
        core.setOutput("carthage_update_text", outputText);
        core.setOutput("carthage_update_json", JSON.stringify(result));
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

run();
