# Moving a repository into a subfolder of another repository's branch

This guide shows how to move a whole project from one repository (the **source**) into a subfolder of a branch in another repository (the **target**), keeping the commit history.

Placeholders used below:

- `<source-url>`: URL of the source repository
- `<source-branch>`: branch of the source repository to move (for example `main`)
- `<target-url>`: URL of the target repository
- `<target-branch>`: branch of the target repository the project goes under
- `<subfolder>`: folder in the target repository that will hold the project (for example `games/team-4/my-project`)
- `<work-branch>`: new branch where the import is prepared

## Before you start

1. Decide the values for the placeholders above.
2. Check the source history for secrets (keys, tokens, passwords) and large binary files. The import carries the full history, so anything in it moves too.
3. Make sure the source repository has no unpushed work.

## Steps

### 1. Clone the target repository and switch to the target branch

```bash
git clone <target-url>
cd <target-repo-folder>
git checkout <target-branch>
```

### 2. Create a work branch

Do not change the target branch directly.

```bash
git checkout -b <work-branch>
```

If the target repository has branch naming rules, follow them (for example `team-N/<issue-number>-<short-description>`).

### 3. Add the source repository under the subfolder

```bash
git subtree add --prefix=<subfolder> <source-url> <source-branch>
```

This creates a merge commit that places the full content of the source repository in `<subfolder>`, together with its commit history.

If you do not need the individual old commits, squash them into one commit:

```bash
git subtree add --prefix=<subfolder> <source-url> <source-branch> --squash
```

### 4. Check the result

```bash
ls <subfolder>
git log --oneline -10
```

Confirm that the files are inside `<subfolder>` and not scattered in the repository root.

### 5. Fix conflicts and configuration

If the source project had its own `.gitignore`, `package.json`, `README` or CI configuration, these now live inside the subfolder. Update the target repository's build and CI setup so it uses the new paths.

### 6. Push the work branch

```bash
git push -u origin <work-branch>
```

### 7. Open a pull request

Open a pull request from `<work-branch>` into `<target-branch>` and follow the target repository's contribution rules (issue link, labels, PR template, review).

## Things to know

- **File history.** The old commits are kept, but they refer to the paths from the root of the source repository. `git log` on a file in the subfolder does not follow that old history by default. Use `git log --follow` or search by the old paths.
- **Issues and pull requests do not move.** Only commits are transferred. Issues, pull requests and comments stay in the source repository. If you need them, GitHub can transfer an issue or a whole repository, which is a different operation.
- **The source repository is untouched.** You can archive or delete it later, after you have confirmed that everything arrived.
- **If something goes wrong,** the target branch is still untouched because all work happened on `<work-branch>`. Delete the work branch and start again.
- **Name clashes.** If `<subfolder>` already exists, or the target branch contains files with the same names, resolve that before running the import.
