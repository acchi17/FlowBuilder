# test-app5

## Project setup
```
npm install
```

### Compiles and hot-reloads for Electron development
```
npm run electron:serve
```

### Compiles and minifies for Electron production (App packaging)
```
npm run electron:build
```

### Compiles and hot-reloads for web (browser) development (if needed)
```
npm run serve
```

### Compiles and minifies for web (browser) production (if needed)
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

---

## Development Notes

### DeprecationWarning for 'main' field in dist_electron/package.json

When running `npm run electron:serve`, you might encounter the following warning:

```
(node:xxxx) [DEP0128] DeprecationWarning: Invalid 'main' field in '\\?\C:\Users\...\dist_electron\package.json' of 'background.js'. Please either fix that or report it to the module author
```

**Explanation:**

This warning is related to how `vue-cli-plugin-electron-builder` generates a temporary `package.json` in the `dist_electron` directory during development. The `main` field in this temporary file might not strictly adhere to the format expected by newer versions of Electron, leading to this deprecation warning.

**Impact:**

*   **Generally, this warning does not affect the application's functionality during development.** It's primarily a notice about a deprecated practice by the build tooling.
*   The final production build handles packaging differently, so this specific warning is usually not an issue in the distributed application.

**Possible Actions (if concerned):**

1.  **Monitor `vue-cli-plugin-electron-builder` updates:** Future versions of the plugin may address this. Check the plugin's GitHub repository 이슈 for discussions or fixes.
2.  **Verify application behavior:** As long as the application runs as expected, this warning can often be safely noted without immediate action.

This note is for awareness, as the application should still function correctly despite this warning.

### DeprecationWarning for Electron Session API (Devtools Installation)

You might also see warnings like these:
```
(electron) 'session.getAllExtensions' is deprecated and will be removed. Please use 'session.extensions.getAllExtensions' instead.
(electron) 'session.loadExtension' is deprecated and will be removed. Please use 'session.extensions.loadExtension' instead.
```

**Explanation:**

These warnings indicate that `electron-devtools-installer` (used in `src/background.js` to install Vue Devtools) is calling Electron `session` APIs that are now deprecated. Electron is transitioning to a new `session.extensions` API for managing browser extensions.

**Impact:**

*   **Primarily related to devtools installation:** If Vue Devtools are still installing and working correctly, these warnings are informational and point to outdated API usage within the `electron-devtools-installer` library.
*   **No direct impact on application core logic:** This should not affect your application's main functionality.

**Possible Actions (if concerned):**

1.  **Check `electron-devtools-installer` version/updates:** The library (currently `^4.0.0` in this project) may need an update to use the new Electron APIs. Check its GitHub repository for newer versions or discussions on this topic.
2.  **Monitor Electron and Vue Devtools compatibility:** Ensure that the versions of Electron, Vue Devtools, and `electron-devtools-installer` remain compatible.

As long as Vue Devtools function as expected, these warnings can be noted, and a fix would typically come from an update to the `electron-devtools-installer` library.
