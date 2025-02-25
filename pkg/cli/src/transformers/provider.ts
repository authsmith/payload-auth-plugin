import { SourceFile, SyntaxKind } from "ts-morph"
import { Transformer } from "./index.js"
import { providersConfig } from "../config/auth-provider-config.js"

export const transformProvider: Transformer = async ({
  sourceFile,
  pluginType,
  providers: incomingProviders,
}) => {
  const payloadAuthPluginsDecl =
    sourceFile.getVariableDeclaration("payloadAuthPlugins")

  if (payloadAuthPluginsDecl) {
    const initializer = payloadAuthPluginsDecl.getInitializerIfKind(
      SyntaxKind.ArrayLiteralExpression,
    )

    if (initializer) {
      initializer.getElements().forEach((element) => {
        if (element.isKind(SyntaxKind.CallExpression)) {
          const expr = element.getExpression()
          if (expr.getText() === pluginType) {
            const args = element.getArguments()
            if (
              args.length > 0 &&
              args[0].isKind(SyntaxKind.ObjectLiteralExpression)
            ) {
              const providersProperty = args[0].getProperty("providers")

              if (providersProperty?.isKind(SyntaxKind.PropertyAssignment)) {
                const providersArray = providersProperty.getInitializerIfKind(
                  SyntaxKind.ArrayLiteralExpression,
                )

                if (providersArray && incomingProviders) {
                  const existingProviderNames = providersArray
                    .getElements()
                    .filter((el) => el.isKind(SyntaxKind.CallExpression))
                    .map((el) => el.getExpression().getText())

                  for (const incomingProvider of incomingProviders) {
                    if (!existingProviderNames.includes(incomingProvider)) {
                      providersArray.addElement(
                        providersConfig[incomingProvider],
                      )
                    }
                    updateProviderImport(incomingProvider, sourceFile)
                  }
                }
              }
            }
          }
        }
      })
    }
  }
  sourceFile.formatText()
  await sourceFile.save()
  return sourceFile
}

function updateProviderImport(provider: string, sourceFile: SourceFile) {
  const importDcl = sourceFile
    .getImportDeclarations()
    .find(
      (dcl) =>
        dcl.getModuleSpecifierValue() === "payload-auth-plugin/providers",
    )
  if (importDcl) {
    const existingNamedImport = importDcl
      .getNamedImports()
      .find((namedImport) => namedImport.getName() === provider)
    if (!existingNamedImport) {
      importDcl.addNamedImport(provider)
    }
  }
}
