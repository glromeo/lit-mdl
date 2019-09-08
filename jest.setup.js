require("@webcomponents/custom-elements");

// This is a workaround for a jdom prototypes limitation that makes the @webcomponents/custom-elements polyfill
// fail silently when instantiating a custom element.
// (See: 'The custom element constructor\'s prototype is not an object.' in CustomElementRegistry.js)
Object.setPrototypeOf(EventTarget.prototype, Object);

// Other ponyfill, polyfill & mocks...

const noop = () => {};

Object.defineProperty(window, scrollTo, {value: noop, writable: true});