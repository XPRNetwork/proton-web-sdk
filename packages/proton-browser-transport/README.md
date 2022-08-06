# Proton Link - Browser Transport [![Package Version](https://img.shields.io/npm/v/@proton/browser-transport.svg?style=flat-square)](https://www.npmjs.com/package/@proton/browser-transport) ![License](https://img.shields.io/npm/l/@proton/browser-transport.svg?style=flat-square)

A transport library for usage of [Proton Link](https://github.com/protonprotocol/proton-link) within a web browser environment.

## Basic usage

A transport is required for Proton Link to communicate with clients. In most examples we use the browser transport with no configuration, like so:

```ts
const transport = new ProtonBrowserTransport()
const link = new ProtonLink({transport})
```

Parameters can be passed to the transport during construction as an object, allowing for the following optional changes:

```ts
const transport = new ProtonBrowserTransport({
    /** CSS class prefix, defaults to `proton-link` */
    classPrefix: 'my-css-prefix',
    /** Whether to inject CSS styles in the page header, defaults to true. */
    injectStyles: true,
    /** Whether to display request success and error messages, defaults to true */
    requestStatus: true,
    /** Local storage prefix, defaults to `proton-link`. */
    storagePrefix: 'my-localstorage-prefix',
    /**
     * Whether to use Greymass Fuel for low resource accounts, defaults to false.
     *  Note that this service is not available on all networks, and will automatically
     *  determine based on chain id if it should be enabled or not.
     */
    disableGreymassFuel: false,
    /** Referral account to use for Greymass Fuel. */
    fuelReferrer: 'teamgreymass',
})
const link = new ProtonLink({transport})
```

## Developing

You need [Make](https://www.gnu.org/software/make/), [node.js](https://nodejs.org/en/) and [yarn](https://classic.yarnpkg.com/en/docs/install) installed.

Clone the repository and run `make` to checkout all dependencies and build the project. See the [Makefile](./Makefile) for other useful targets. Before submitting a pull request make sure to run `make lint`.

## License

[MIT](./LICENSE.md)

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
