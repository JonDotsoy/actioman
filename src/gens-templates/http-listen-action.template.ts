import * as path from "path";
import {
  $,
  $template,
  $import,
  $const,
  $call,
  $await,
  $string,
  $new,
  $statement,
  $doc,
  render,
  $asyncArrowFunction,
} from "./typescript-factory/typescript-factory.js";

type ProgramASTProps = {
  httpListenerModuleLocation: string;
  configsModuleLocation: string;
  configsFactoryModuleLocation: string;
  actionRelativeFileLocation: string;
  relativeWorkspaceLocation: string;
};

const getTSProgram = (props: ProgramASTProps) =>
  $doc([
    $import(props.httpListenerModuleLocation, ["HTTPLister"]),
    $import(props.configsFactoryModuleLocation, ["factory"]),
    $import(props.configsModuleLocation, ["Configs"]),
    $const("PORT", $("process", "env", "PORT")),
    $const("HOST", $("process", "env", "HOST")),
    $const(
      "bootstrap",
      $asyncArrowFunction([
        $const(
          "configs",
          $call(
            $("Configs", "fromModule"),
            $await(
              $call(
                $("factory", "findOn"),
                $call(
                  $(
                    $new(
                      "URL",
                      $string(props.relativeWorkspaceLocation),
                      $("import", "meta", "url"),
                    ),
                    "toString",
                  ),
                ),
                $string("configs"),
              ),
            ),
          ),
        ),
        $const(
          "httpLister",
          $await(
            $call(
              $("HTTPLister", "fromModule"),
              $await(
                $call("import", $string(props.actionRelativeFileLocation)),
              ),
              $("configs"),
            ),
          ),
        ),
        $const(
          "url",
          $await($call($("httpLister", "listen"), $("PORT"), $("HOST"))),
        ),
        $statement(
          $call(
            $("console", "log"),
            $template`Server running at ${$call($("url", "toString"))}`,
          ),
        ),
      ]),
    ),
    $statement($call($($call("bootstrap"), "catch"), $("console", "error"))),
  ]);

type Props = {
  target: string;
  actionFileLocation: string;
  workspaceLocation: string;
  modules: {
    httpListenerModuleLocation: string;
    configsModuleLocation: string;
    configsFactoryModuleLocation: string;
  };
};

export const httpListenActionTemplate = (props: Props) => {
  const resolvePath = (target: string) => new URL(target, "file://");
  const filename = resolvePath(props.target);
  const dirname = new URL("./", filename);
  const actionFileLocation = resolvePath(props.actionFileLocation);
  const workspaceLocation = resolvePath(props.workspaceLocation);
  const httpListenerModuleLocation = resolvePath(
    props.modules.httpListenerModuleLocation,
  );
  const configsModuleLocation = resolvePath(
    props.modules.configsModuleLocation,
  );
  const configsFactoryModuleLocation = resolvePath(
    props.modules.configsFactoryModuleLocation,
  );

  const relative = (path2: URL) => {
    return `./${path.relative(dirname.pathname, path2.pathname)}`;
  };

  const ast = getTSProgram({
    httpListenerModuleLocation: relative(httpListenerModuleLocation),
    configsModuleLocation: relative(configsModuleLocation),
    configsFactoryModuleLocation: relative(configsFactoryModuleLocation),
    actionRelativeFileLocation: relative(actionFileLocation),
    relativeWorkspaceLocation: `${relative(workspaceLocation)}/`,
  });

  return `// @ts-nocheck\n${render(ast)}`;
};
