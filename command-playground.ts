import spec from "conventional-changelog-config-spec/versions/2.1.0/schema.json";
import defaults from "./defaults";
import { Command } from "@commander-js/extra-typings";
import { Option } from "commander";
import { CatVConfig } from "lib/opts";

const program = new Command()
  .usage("Usage: $0 [options]")
  .option(
    "--packageFiles <filepaths...>",
    '[Array] Files where versions can be read from and be "bumped"',
    defaults.packageFiles as any as string[]
  )
  .option(
    "--bumpFiles <filepaths...>",
    '[Array] files where versions should be "bumped", but not explicitly read from.',
    defaults.bumpFiles as any as string[]
  )
  .option(
    "-r, --release-as <type>",
    "[string] Specify the release type manually (like npm version <major|minor|patch>)"
  )
  .option(
    "-p, --prerelease [type]",
    "make a pre-release with optional option value to specify a tag id"
  )
  .option(
    "-i, --infile <filepath>",
    "Read the CHANGELOG from this file",
    defaults.infile
  )
  .option(
    "-m, --message <message>",
    "[DEPRECATED] Commit message, replaces %s with new version.\nThis option will be removed in the next major version, please use --releaseCommitMessageFormat."
  )
  .option(
    "-f, --first-release",
    "Is this the first release?",
    defaults.firstRelease
  )
  .option(
    "-s, --sign",
    "Should the git commit and tag be signed?",
    defaults.sign
  )
  .option(
    "-n, --no-verify",
    "Bypass pre-commit or commit-msg git hooks during the commit phase",
    defaults.noVerify
  )
  .option(
    "-a, --commit-all",
    "Commit all staged changes, not just files affected by commit-and-tag-version",
    defaults.commitAll
  )
  .option("--silent", "Don't print logs and errors", defaults.silent)
  .option(
    "-t, --tag-prefix <prefix>",
    "Set a custom prefix for the git tag to be created",
    defaults.tagPrefix
  )
  .option(
    "--release-count <number>",
    "How many releases of changelog you want to generate. It counts from the upcoming release. Useful when you forgot to generate any previous changelog. Set to 0 to regenerate all.",
    (v) => Number(v),
    defaults.releaseCount
  )
  .option("--tag-force", "Allow tag replacement", defaults.tagForce)
  .addOption(
    new Option(
      "--scripts.prerelease, --scripts.prebump, --scripts.postbump, --scripts.prechangelog, --scripts.postchangelog, --scripts.precommit, --scripts.postcommit, --scripts.pretag, --scripts.posttag  <script>",
      "Provide scripts to execute for lifecycle events (prebump, precommit, etc.,)"
    )
      .argParser<Partial<CatVConfig["scripts"]>>((s, p) => {
        console.log(s, p);
        const [key, value] = s.replace("--scripts.", "").split("s") as [
          keyof typeof p,
          typeof p[keyof typeof p]
        ];
        if (!key)
          throw new Error(
            'Lifecycle scripts must be passed using dot notation (e.g. "--scripts.prebump ./path/to/script'
          );
        if (!value)
          throw new Error(`A value must be provided for --scripts.${key}`);
        p[key] = value;
        return p;
      })
      .default(defaults.scripts)
  )
  .option(
    "--skip.bump",
    undefined /* 'Map of steps in the release process that should be skipped' */,
    defaults.skip["bump" as keyof {}]
  )
  .option("--skip.changelog", undefined, defaults.skip["changelog" as keyof {}])
  .option("--skip.commit", undefined, defaults.skip["changelog" as keyof {}])
  .option("--skip.tag", undefined, defaults.skip["changelog" as keyof {}])
  .option(
    "--dry-run",
    "See the commands that running commit-and-tag-version would run",
    defaults.dryRun
  )
  .option(
    "--git-tag-fallback",
    "fallback to git tags for version, if no meta-information file is found (e.g., package.json)",
    defaults.gitTagFallback
  )
  .option("--path <path>", "Only populate commits made under this path")
  .option(
    "--changelogHeader",
    "[DEPRECATED] Use a custom header when generating and updating changelog.\nThis option will be removed in the next major version, please use --header."
  )
  .option(
    "--preset <preset>",
    "Commit message guideline preset",
    defaults.preset
  )
  .option(
    "--lerna-package <name>",
    "Name of the package from which the tags will be extracted"
  )
  .option(
    "--npmPublishHint <hint>",
    "Customized publishing hint",
    defaults.npmPublishHint
  )
  .helpOption("-h, --help")
  .version(
    await (async () => (await import("./package.json"))["version"])(),
    "-v, --version"
  );

// Previously, there were examples in the `yarg` implementation. They aren't supported by `commander`, but they were broken anyway.
//  .pkgConf('standard-version')
//  .pkgConf('commit-and-tag-version')
//  .parserConfiguration(getConfiguration())
//  .wrap(97)

Object.keys(spec.properties).forEach((propertyKey) => {
  const k = propertyKey as keyof typeof spec.properties & keyof typeof defaults;

  const { description, type, default: fallback } = spec.properties[k];
  const defaultVal = defaults[k] ?? fallback;

  if (type === "boolean") {
    if (typeof defaultVal !== "boolean") throw new Error("Invalid default");
    program.option(`--${propertyKey}`, `${description}`, defaultVal);
  }
  if (type === "string") {
    if (typeof defaultVal !== "string") throw new Error("Invalid default");
    program.option(`--${propertyKey} <value>`, `${description}`, defaultVal);
  }
  if (type === "integer") {
    if (typeof defaultVal !== "number") throw new Error("Invalid default");
    program.option(`--${propertyKey} <value>`, `${description}`, defaultVal);
  }
  if (type === "array") {
    if (!Array.isArray(defaultVal)) throw new Error("Invalid default");
    program.option(`--${propertyKey} <value>`, `${description}`, defaultVal);
  }
});

export default program;

/**
 *pkgConf(key: string, rootPath?: string): YargsInstance {
    argsert('<string> [string]', [key, rootPath], arguments.length);
    let conf = null;
    // prefer cwd to require-main-filename in this method
    // since we're looking for e.g. "nyc" config in nyc consumer
    // rather than "yargs" config in nyc (where nyc is the main filename)
    const obj = this[kPkgUp](rootPath || this.#cwd);

    // If an object exists in the key, add it to options.configObjects
    if (obj[key] && typeof obj[key] === 'object') {
      conf = applyExtends(
        obj[key] as {[key: string]: string},
        rootPath || this.#cwd,
        this[kGetParserConfiguration]()['deep-merge-config'] || false,
        this.#shim
      );
      this.#options.configObjects = (this.#options.configObjects || []).concat(
        conf
      );
    }
    return th
 */
