import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const sdkPackageName = "@apps-in-toss/web-framework";
const enginePackageName = "@apps-in-toss/ait-format";

const npmExecPath = process.env.npm_execpath;
const npmCommand = npmExecPath ? process.execPath : process.platform === "win32" ? "npm.cmd" : "npm";
const npmBaseArgs = npmExecPath ? [npmExecPath] : [];

const parseArgs = (argv) => {
  const args = new Set();

  for (const item of argv) {
    if (item.startsWith("--")) {
      args.add(item.slice(2));
    }
  }

  return args;
};

const readJsonFile = (path) => JSON.parse(readFileSync(path, "utf8"));

const runText = (command, args) => {
  try {
    return {
      ok: true,
      exitCode: 0,
      stdout: execFileSync(command, args, {
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 20,
        stdio: ["ignore", "pipe", "pipe"]
      }).trim(),
      stderr: ""
    };
  } catch (error) {
    return {
      ok: false,
      exitCode: Number.isInteger(error.status) ? error.status : 1,
      stdout: String(error.stdout ?? "").trim(),
      stderr: String(error.stderr ?? "").trim()
    };
  }
};

const parseJson = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const runNpmJson = (args) => {
  const result = runText(npmCommand, [...npmBaseArgs, ...args]);

  return {
    ...result,
    data: parseJson(result.stdout)
  };
};

const packageLockEntry = (packageLock, packageName) => packageLock.packages?.[`node_modules/${packageName}`] ?? null;

const packageLockRootDependency = (packageLock, packageName) =>
  packageLock.packages?.[""]?.dependencies?.[packageName] ?? null;

const numberValue = (value) => (Number.isFinite(value) ? value : 0);

const summarizeAudit = (auditData) => {
  const vulnerabilities = auditData?.metadata?.vulnerabilities ?? {};

  return {
    low: numberValue(vulnerabilities.low),
    moderate: numberValue(vulnerabilities.moderate),
    high: numberValue(vulnerabilities.high),
    critical: numberValue(vulnerabilities.critical),
    total: numberValue(vulnerabilities.total)
  };
};

const collectFixHints = (auditData) => {
  const vulnerabilities = Object.values(auditData?.vulnerabilities ?? {});
  const hints = new Map();

  for (const vulnerability of vulnerabilities) {
    const fixAvailable = vulnerability?.fixAvailable;

    if (!fixAvailable || typeof fixAvailable !== "object") {
      continue;
    }

    const name = fixAvailable.name;
    const version = fixAvailable.version;

    if (!name || !version) {
      continue;
    }

    const key = `${vulnerability.name ?? "unknown"}|${name}|${version}|${Boolean(fixAvailable.isSemVerMajor)}`;
    hints.set(key, {
      source: vulnerability.name ?? "unknown",
      packageName: name,
      version,
      semverMajor: Boolean(fixAvailable.isSemVerMajor)
    });
  }

  return [...hints.values()].sort((left, right) => {
    if (left.packageName !== right.packageName) {
      return left.packageName.localeCompare(right.packageName);
    }

    return left.source.localeCompare(right.source);
  });
};

const compareLatest = (lockedVersion, latestVersion) => {
  if (!latestVersion) {
    return "unknown";
  }

  if (lockedVersion === latestVersion) {
    return "current";
  }

  return "revisit_required";
};

export const createSdkDependencyTriage = ({ packageLock, npmVersion, latestVersion, prodAudit, fullAudit }) => {
  const sdkEntry = packageLockEntry(packageLock, sdkPackageName);
  const engineEntry = packageLockEntry(packageLock, enginePackageName);
  const lockedVersion = sdkEntry?.version ?? null;
  const requestedVersion = packageLockRootDependency(packageLock, sdkPackageName);
  const engineVersion = engineEntry?.version ?? null;
  const engineRange = engineEntry?.engines?.node ?? null;
  const prodCounts = summarizeAudit(prodAudit.data);
  const fullCounts = summarizeAudit(fullAudit.data);

  const strictFailures = [];
  const latestStatus = compareLatest(lockedVersion, latestVersion);

  if (!lockedVersion) {
    strictFailures.push(`${sdkPackageName} is missing from package-lock.json`);
  }

  if (!latestVersion) {
    strictFailures.push(`Unable to read npm latest version for ${sdkPackageName}`);
  }

  if (latestStatus === "revisit_required") {
    strictFailures.push(`${sdkPackageName} latest is ${latestVersion}, locked is ${lockedVersion}`);
  }

  if (!engineRange) {
    strictFailures.push(`${enginePackageName} Node engine range is missing`);
  }

  if (!prodAudit.data) {
    strictFailures.push("Production npm audit JSON could not be parsed");
  }

  if (!fullAudit.data) {
    strictFailures.push("Full npm audit JSON could not be parsed");
  }

  return {
    checkedAt: new Date().toISOString(),
    runtime: {
      node: process.version,
      npm: npmVersion
    },
    sdk: {
      packageName: sdkPackageName,
      requestedVersion,
      lockedVersion,
      latestVersion,
      latestStatus
    },
    enginePackage: {
      packageName: enginePackageName,
      lockedVersion: engineVersion,
      nodeEngine: engineRange
    },
    audit: {
      production: {
        exitCode: prodAudit.exitCode,
        counts: prodCounts
      },
      full: {
        exitCode: fullAudit.exitCode,
        counts: fullCounts
      }
    },
    fixHints: collectFixHints(fullAudit.data),
    strictFailures
  };
};

const printCountsRow = (label, counts) => {
  console.log(`| ${label} | ${counts.total} | ${counts.low} | ${counts.moderate} | ${counts.high} | ${counts.critical} |`);
};

const printMarkdown = (triage) => {
  console.log("SDK dependency triage");
  console.log("");
  console.log("| Item | Value |");
  console.log("| --- | --- |");
  console.log(`| Local Node | ${triage.runtime.node} |`);
  console.log(`| Local npm | ${triage.runtime.npm ?? "unknown"} |`);
  console.log(`| SDK locked | ${triage.sdk.packageName}@${triage.sdk.lockedVersion ?? "missing"} |`);
  console.log(`| SDK requested | ${triage.sdk.requestedVersion ?? "missing"} |`);
  console.log(`| SDK npm latest | ${triage.sdk.latestVersion ?? "unknown"} |`);
  console.log(`| SDK latest status | ${triage.sdk.latestStatus} |`);
  console.log(
    `| Engine package | ${triage.enginePackage.packageName}@${triage.enginePackage.lockedVersion ?? "missing"} requires Node ${triage.enginePackage.nodeEngine ?? "unknown"} |`
  );
  console.log("");
  console.log("| Scope | Total | Low | Moderate | High | Critical |");
  console.log("| --- | ---: | ---: | ---: | ---: | ---: |");
  printCountsRow("Production dependencies", triage.audit.production.counts);
  printCountsRow("Full dependency tree", triage.audit.full.counts);
  console.log("");

  const majorHints = triage.fixHints.filter((hint) => hint.semverMajor);
  if (majorHints.length > 0) {
    console.log("| Source | Suggested package | Version | Semver major |");
    console.log("| --- | --- | --- | --- |");

    for (const hint of majorHints) {
      console.log(`| ${hint.source} | ${hint.packageName} | ${hint.version} | ${hint.semverMajor ? "yes" : "no"} |`);
    }

    console.log("");
  }

  console.log("Policy: do not run `npm audit fix --force` on the SDK tree without commander approval.");

  if (triage.strictFailures.length > 0) {
    console.log("");
    console.log("Strict checks that need review:");

    for (const failure of triage.strictFailures) {
      console.log(`- ${failure}`);
    }
  }
};

const printHelp = () => {
  console.log("Usage: node scripts/check-sdk-dependency-triage.mjs [--json] [--strict]");
  console.log("");
  console.log("Reports Apps in Toss SDK package metadata, Node engine requirements, and npm audit counts.");
  console.log("--strict fails when the SDK latest version cannot be confirmed, differs from the lock, or audit JSON is unavailable.");
};

const main = () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.has("help")) {
    printHelp();
    return;
  }

  const npmVersion = runText(npmCommand, [...npmBaseArgs, "--version"]);
  const latestVersion = runNpmJson(["view", sdkPackageName, "version", "--json"]);
  const prodAudit = runNpmJson(["audit", "--omit=dev", "--json"]);
  const fullAudit = runNpmJson(["audit", "--json"]);
  const packageLock = readJsonFile("package-lock.json");
  const triage = createSdkDependencyTriage({
    packageLock,
    npmVersion: npmVersion.ok ? npmVersion.stdout : null,
    latestVersion: typeof latestVersion.data === "string" ? latestVersion.data : null,
    prodAudit,
    fullAudit
  });

  if (args.has("json")) {
    console.log(JSON.stringify(triage, null, 2));
  } else {
    printMarkdown(triage);
  }

  if (args.has("strict") && triage.strictFailures.length > 0) {
    process.exitCode = 1;
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
