import tseslint from 'typescript-eslint';
import securityPlugin from 'eslint-plugin-security';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import promisePlugin from 'eslint-plugin-promise';
import importPlugin from 'eslint-plugin-import';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

/**
 * Deep ESLint Configuration for TRUE Deep Scan
 * 
 * This configuration enables ALL strict rules for comprehensive code analysis.
 * Use this for pre-release deep scans, not for daily development.
 * 
 * Usage: npx eslint --config eslint.deep.config.mjs src/
 */
export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "dist/**",
      "build/**",
      "coverage/**"
    ]
  },
  
  // Base TypeScript recommended rules
  ...tseslint.configs.strictTypeChecked,
  
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    
    plugins: {
      'security': securityPlugin,
      'sonarjs': sonarjsPlugin,
      'promise': promisePlugin,
      'import': importPlugin,
      'react-hooks': reactHooksPlugin,
    },
    
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    
    rules: {
      // ========================================================================
      // TypeScript Strict Rules
      // ========================================================================
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": ["warn", {
        "allowExpressions": true,
        "allowTypedFunctionExpressions": true
      }],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/consistent-type-imports": ["warn", {
        "prefer": "type-imports"
      }],
      
      // ========================================================================
      // Security Rules (Critical for Production)
      // ========================================================================
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "warn",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-non-literal-require": "warn",
      "security/detect-possible-timing-attacks": "error",
      "security/detect-pseudoRandomBytes": "error",
      
      // ========================================================================
      // SonarJS Rules (Code Quality & Bug Detection)
      // ========================================================================
      "sonarjs/cognitive-complexity": ["error", 15],
      "sonarjs/no-identical-functions": "error",
      "sonarjs/no-duplicate-string": ["warn", { "threshold": 5 }],
      "sonarjs/no-collapsible-if": "warn",
      "sonarjs/no-collection-size-mischeck": "error",
      "sonarjs/no-duplicated-branches": "error",
      "sonarjs/no-gratuitous-expressions": "error",
      "sonarjs/no-identical-conditions": "error",
      "sonarjs/no-inverted-boolean-check": "warn",
      "sonarjs/no-redundant-boolean": "warn",
      "sonarjs/no-same-line-conditional": "error",
      "sonarjs/no-small-switch": "warn",
      "sonarjs/no-unused-collection": "error",
      "sonarjs/no-use-of-empty-return-value": "error",
      "sonarjs/prefer-immediate-return": "warn",
      "sonarjs/prefer-object-literal": "warn",
      "sonarjs/prefer-single-boolean-return": "warn",
      "sonarjs/prefer-while": "warn",
      
      // ========================================================================
      // Promise Rules (Async/Await Best Practices)
      // ========================================================================
      "promise/always-return": "error",
      "promise/no-return-wrap": "error",
      "promise/param-names": "error",
      "promise/catch-or-return": "error",
      "promise/no-nesting": "warn",
      "promise/no-promise-in-callback": "warn",
      "promise/no-callback-in-promise": "warn",
      "promise/avoid-new": "off",
      "promise/no-new-statics": "error",
      "promise/no-return-in-finally": "error",
      "promise/valid-params": "error",
      
      // ========================================================================
      // Import Rules (Module Organization)
      // Note: Some import rules disabled due to ESLint 10 compatibility
      // ========================================================================
      "import/no-unresolved": "off", // TypeScript handles this
      "import/no-duplicates": "error",
      "import/no-unused-modules": "off", // ESLint 10 incompatible
      "import/no-cycle": "off", // Use madge instead: npm run analyze:deps
      "import/no-self-import": "error",
      "import/first": "error",
      "import/order": "off", // ESLint 10 incompatible - use prettier or editor
      
      // ========================================================================
      // React Hooks Rules (Critical for React Apps)
      // ========================================================================
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      
      // ========================================================================
      // General Code Quality
      // ========================================================================
      "no-console": ["warn", { 
        "allow": ["warn", "error"] 
      }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "warn",
      "prefer-template": "warn",
      "eqeqeq": ["error", "always"],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-return-await": "off", // Conflicts with @typescript-eslint
      "require-await": "off", // Use TypeScript version
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/only-throw-error": "error", // Replaced no-throw-literal
      "no-param-reassign": ["error", {
        "props": false
      }],
      "complexity": ["warn", 20],
      "max-depth": ["warn", 4],
      "max-lines-per-function": ["warn", {
        "max": 150,
        "skipBlankLines": true,
        "skipComments": true
      }],
      "max-params": ["warn", 5],
    }
  },
  
  // Specific overrides for test files
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "sonarjs/no-duplicate-string": "off",
      "max-lines-per-function": "off",
    }
  },
  
  // Specific overrides for config files
  {
    files: ["*.config.{js,mjs,ts}", "*.setup.{js,ts}"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
      "import/no-unused-modules": "off",
    }
  }
);
