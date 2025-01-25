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
      mkdir -p /tmp/__tests/caches/
      if [ -f "/tmp/__tests/caches/${TMP_FILE_NAME}.hash" ]
      then
        current_hash=$(cat /tmp/__tests/caches/${TMP_FILE_NAME}.hash)
      fi
      hash=$(find src/ -type f -not -name  "*.spec.*" | sort  | xargs -I {} cat {} | shasum | awk '{{print $1}}')
      echo $hash > /tmp/__tests/caches/${TMP_FILE_NAME}.hash
      if [ "$current_hash" = "$hash" ]
      then
        rm -f  /tmp/__tests/caches/${TMP_FILE_NAME}_actioman_module.changed
        exit 0
      fi
      npm pack
      tarfile=$(realpath $(cat package.json | jq -r '"" + .name + "-" + .version + ".tgz"'))
      echo tarfile=$tarfile
      mv $tarfile /tmp/__tests/caches/${TMP_FILE_NAME}_actioman_module.tgz
      echo "true" > /tmp/__tests/caches/${TMP_FILE_NAME}_actioman_module.changed
    `;

    await $work`
      set -e
      mkdir -p /tmp/caches
      if [ -f /tmp/__tests/caches/${TMP_FILE_NAME}.tgz ]
      then
        tar -xzf /tmp/__tests/caches/${TMP_FILE_NAME}.tgz || true
      fi
      if [ ! -f "package.json" ]
      then
        npm init -y
        npm pkg set "type=module"
      fi
      if [ -f /tmp/__tests/caches/${TMP_FILE_NAME}_actioman_module.changed ]
      then
        npm add /tmp/__tests/caches/${TMP_FILE_NAME}_actioman_module.tgz
      fi
      tar -czf /tmp/__tests/caches/${TMP_FILE_NAME}.tgz . || true
    `;

    return {
      $,
      $work,
    };
  }
}
