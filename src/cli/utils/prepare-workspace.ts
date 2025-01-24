import { beforeEach } from "bun:test";
import { $ } from "../../shell/shell.js";

const TMP_FILE_NAME =
  "0x06faf929b5dbc136c97d5e550a59a21a111f000021e81a62bf065030c842ab9f3";

export class PrepareWorkspace {
  static async setup(metaUrl: string) {
    await $`
      set -e
      TEST_DIR=__tests__/sample_project/
      rm -rf $TEST_DIR
      mkdir -p $TEST_DIR
      echo "*" > "__tests__/.gitignore"
    `.cwd(new URL("./", metaUrl).pathname);

    const $work = $.cwd(
      new URL("./__tests__/sample_project/", metaUrl).pathname,
    );

    await $`
      set -e
      current_hash=""
      if [ -f "/tmp/caches/${TMP_FILE_NAME}.hash" ]
      then
        current_hash=$(cat /tmp/caches/${TMP_FILE_NAME}.hash)
      fi
      hash=$(find src/ -type f -not -name  "*.spec.*" | sort  | xargs -I {} cat {} | shasum | awk '{{print $1}}')
      echo $hash > /tmp/caches/${TMP_FILE_NAME}.hash
      if [ "$current_hash" = "$hash" ]
      then
        rm -f  /tmp/caches/${TMP_FILE_NAME}_actioman_module.changed
        exit 0
      fi
      npm pack
      tarfile=$(realpath $(cat package.json | jq -r '"" + .name + "-" + .version + ".tgz"'))
      echo tarfile=$tarfile
      mv $tarfile /tmp/caches/${TMP_FILE_NAME}_actioman_module.tgz
      echo "true" > /tmp/caches/${TMP_FILE_NAME}_actioman_module.changed
    `;

    await $work`
      set -e
      mkdir -p /tmp/caches
      if [ -f /tmp/caches/${TMP_FILE_NAME}.tgz ]
      then
        tar -xzf /tmp/caches/${TMP_FILE_NAME}.tgz
      fi
      if [ ! -f "package.json" ]
      then
        npm init -y
        npm pkg set "type=module"
      fi
      if [ -f /tmp/caches/${TMP_FILE_NAME}_actioman_module.changed ]
      then
        npm add /tmp/caches/${TMP_FILE_NAME}_actioman_module.tgz
      fi
      tar -czf /tmp/caches/${TMP_FILE_NAME}.tgz .
    `;

    return {
      $,
      $work,
    };
  }
}
