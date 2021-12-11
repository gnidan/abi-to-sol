# abi-to-sol Release Procedure

1. Cut release branch from `develop`

   ```console
   git checkout -b release
   git push -u origin release
   ```

2. Sanity-check: see what packages changed

   ```console
   npx lerna changed
   ```

3. Update package versions

   ```console
   npx lerna version
   ```

4. Rebuild project

   ```console
   yarn
   ```

5. Perform release

   ```console
   npx lerna publish from-package
   ```

6. Update CHANGELOG.md, replacing `vNext` with corresponding version, and
   adding link to release notes page (although URL won't exist yet)

   ```console
   vim CHANGELOG.md
   git add CHANGELOG.md
   git commit -m "Update CHANGELOG"
   ```

7. PR `release` -> `develop` and then delete branch `release` on GitHub
   once merged.

8. Delete local `release` branch

   ```console
   git checkout develop
   git pull
   git branch -D release
   ```

9. Sync `master` with `develop` and such

   ```console
   git checkout master
   git pull
   git merge develop
   git push
   git checkout develop
   git merge master
   git push
   ```

10. Write+publish release notes on GitHub (**don't forget to start
    discussion topic for the release**)

11. Wait for Web UI to build and visit page to make sure everything's
    honkidori

12. Install abi-to-sol package for good measure
