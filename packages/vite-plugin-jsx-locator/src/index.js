import { parse } from '@babel/parser';
import generatorModule from '@babel/generator';
import traverseModule from '@babel/traverse';
import * as t from '@babel/types';
import path from 'node:path';

const traverse = traverseModule.default;
const generate = generatorModule.default;
const MARKER = 'data-jsx-open-in-code-file';

function attribute(name, value) {
  return t.jsxAttribute(t.jsxIdentifier(name), t.stringLiteral(String(value)));
}

function ownerComponentName(path) {
  const owner = path.findParent((candidate) => (
    t.isFunctionDeclaration(candidate.node)
    || t.isFunctionExpression(candidate.node)
    || t.isArrowFunctionExpression(candidate.node)
    || t.isClassMethod(candidate.node)
  ));
  if (!owner) return null;

  if (t.isFunctionDeclaration(owner.node) && owner.node.id) return owner.node.id.name;
  if (t.isClassMethod(owner.node) && t.isIdentifier(owner.node.key)) return owner.node.key.name;

  const declaration = owner.findParent((candidate) => t.isVariableDeclarator(candidate.node));
  return declaration && t.isIdentifier(declaration.node.id) ? declaration.node.id.name : null;
}

function functionalComponentNames(ast) {
  const names = new Set();
  traverse(ast, {
    FunctionDeclaration(path) {
      if (t.isIdentifier(path.node.id) && /^[A-Z]/.test(path.node.id.name)) names.add(path.node.id.name);
    },
    VariableDeclarator(path) {
      const { id, init } = path.node;
      if (t.isIdentifier(id) && /^[A-Z]/.test(id.name)
        && (t.isArrowFunctionExpression(init) || t.isFunctionExpression(init))) {
        names.add(id.name);
      }
    },
  });
  return names;
}

/**
 * Add source metadata to native JSX tags during `vite serve`.
 * This intentionally does not annotate component tags: native tags give the
 * browser a stable DOM element to inspect and let the nearest source win.
 */
export function jsxLocator() {
  let isDevelopment = false;

  return {
    name: 'jsx-open-in-code:locator',
    enforce: 'pre',
    configResolved(config) {
      isDevelopment = config.command === 'serve';
    },
    transform(code, id) {
      if (!isDevelopment || !/\.(jsx|tsx)$/.test(id) || id.includes('node_modules')) return null;

      const filename = id.split('?')[0];
      let ast;
      try {
        ast = parse(code, {
          sourceType: 'module',
          sourceFilename: filename,
          plugins: ['jsx', 'typescript'],
        });
      } catch {
        return null;
      }
      const components = functionalComponentNames(ast);
      const sourceFileName = path.basename(filename);

      let changed = false;
      traverse(ast, {
        JSXOpeningElement(path) {
          const { node } = path;
          if (!t.isJSXIdentifier(node.name) || !node.loc) return;
          if (node.attributes.some((item) => t.isJSXAttribute(item) && item.name.name === MARKER)) return;

          node.attributes.push(
            attribute(MARKER, filename),
            attribute('data-jsx-open-in-code-line', node.loc.start.line),
            attribute('data-jsx-open-in-code-column', node.loc.start.column + 1),
          );
          const componentName = ownerComponentName(path);
          if (componentName) node.attributes.push(attribute('data-jsx-open-in-code-component', componentName));
          const label = components.size > 1 && componentName
            ? `${sourceFileName} › ${componentName}()`
            : sourceFileName;
          node.attributes.push(attribute('data-jsx-open-in-code-component-label', label));
          changed = true;
        },
      });

      if (!changed) return null;
      const output = generate(ast, {
        sourceMaps: true,
        sourceFileName: filename,
        // JSX attribute strings treat `\\u203A` as literal text, so preserve
        // Unicode breadcrumb separators instead of escaping them.
        jsescOption: { minimal: true },
      }, code);
      return { code: output.code, map: output.map };
    },
  };
}
