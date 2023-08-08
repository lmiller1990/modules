## The History and State of JavaScript Modules

## The Dark Ages and the Module Pattern

Back in the day, there was no such concept of modules. Everything was global, and each "module" was just a script included via <script src="...">. To avoid polluting the global namespace, developers would wrap things in IIFEs - Immediately Invoked Function Expressions.

### IIFEs?

What's an IIFE? Well, firstly, let's see the problem they solve. Given:

```html
<script src="/foo.js"></script>
<script src="/bar.js"></script>
<!-- many more scripts -->
```

Where:

```js
// foo.js
var url = "/todos";

// `window.fetch` won't be standardized for decades
// So we are stuck with XMLHttpRequest
function createTodo(title) {
  var req = new XMLHttpRequest();
  req.addEventListener("load", reqListener);
  req.open("POST", url + "?title=" + title);
  req.send();
}
```

Now `url` is available to be (accidentally) mutated anywhere in the application. You might want this to be the case, but chances are, you don't.

You can work around it, of course. We can create a kind of read only `url` with a function:

```js
function getUrl () {
  return "/todos";
}
```

... but you can still re-assign `getUrl`:

```js
getUrl = () => '/oops'
```

We can use our new `getUrl()` function like:

```js
// `window.fetch` won't be standardized for decades
function createTodo(title) {
  var req = new XMLHttpRequest();
  req.addEventListener("load", reqListener);
  req.open("POST", getUrl() + "?title=" + title);
  req.send();
}
```

`createTodo` suffers from the same problem - like everything else, it's global and mutable. As your application scales, more developers are more `<script>` tags and update existing ones, and doing anything significant requires developers to have a strong mental model of where everything is and how it works.

Although it would be a good while before the first module systems would emerge, a neat little trick in the form of Immediately Invoked Function Expressions, or an IIFE, can help with the "everything is mutable" issue. 

We've got `createTodo` - inevitably we will have the rest of the Create/Read/Update/Delete, or CRUD, actions. We might want to group them on a `todo` object:

```js
// no const/let for 20 or so years...
var url = "/todos"

var todo = {
  create (todo) { /* ... */ },
  get (todo) { /* ... */ },
  update (todo) { /* ... */ },
  get (todo) { /* ... */ }
}
```

`todo`, and all the methods, can be overwritten and modified at any point. Let's wrap the entire thing in an IIFE:

```js
var todo = (function() {
  var url = "/todos"
  return {
    create (todo) { /* ... */ },
    get (todo) { /* ... */ },
    update (todo) { /* ... */ },
    get (todo) { /* ... */ }
  }
})()
```

Now, we have local variables. Anything inside the `todo` IIFE is local. `url` cannot be modified globally. It's a local variable! `todo` still can be, though. Maybe we want other scripts to access `todo`. That's fine. If you want all `todo` related code to stay in a single `<script>`, you could change your code:

```js
(function() {
  var url = "/todos"

  var todo = {
    create (todo) { /* ... */ },
    get (todo) { /* ... */ },
    update (todo) { /* ... */ },
    get (todo) { /* ... */ }
  }

  function renderTodos (todos) {
    var $ul = document.getElementById("todo-list")
    for (var i = 0; i < todos.length; i++) {
      var $li = document.createElement('li')
      $li.innerText = todos[i].text
      $ul.appendChild($li)
    }
  }

  function allTodos () {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
      renderTodos(req.response)
    }
  } 
})()
```

Now your application will fetch and renders the todos - all the code is executed inside a IIFE, and no-one is any the wiser.

## But Modules?

One of the benefits of modules is local variables. You generally don't want everything to be global. Another benefit is code sharing - you do want *some* of your code to global, ideally when you say so. You also probably don't want to spend too much time thinking about what order `<script>` tags appear in your `index.html`, though - this should be handled at the language level.

Modules were far from the only thing JavaScipt lacked in it's infancy. Other useful things that were missing:

## Better Ways to Declare Variables

`var` doesn't just create a mutable variable. It is "hoisted" - a weird behavior that no-one would expect. It's a bit of mystery why anyone would design such a mechnism, but considering this snippet:

# TODO: hoisting

## A Satisfactory Standard Library

# TODO: stdlib

## More Expressive:

- more expressive ways of looping objects
- a lot of useful methods (like `Array.protocol.includes`)

## More Ergonomics 

- Web APIs (like `fetch`)

To be fair, this wasn't really a JavaScript problem, per se, but the web showing it's immaturity, at least for building application like experiences (although some will argue the web really wasn't, and still isn't, meant for that).

## What are our Options?

Modules and build systems were not a new concept. Tools like `make` 

## CommonJS; Modules for Everyone, Everywhere

The above system is pretty flawed for a bunch of reasons. Modules are all listened in a specific place, in a specific order; the relationship and dependencies are not clear between modules.

After a while, [in 2009, Kevin Dangoor at Mozilla](https://en.wikipedia.org/wiki/CommonJS#cite_note-init-3) had enough and decided it was time for us to have something better - [CommonJS](https://en.wikipedia.org/wiki/CommonJS).

His proposal was mainly for server side JavaScript, which obviously could not use <script src="...">. CommonJS is the module system Node.js adopted.

const foo = require('./foo.js')

It's important to note that this doesn't work well for browsers, since require is synchronous. If we did this in a browser, the main thread would be blocked and the whole browser would lock up if a module import failed.

This didn't stop people from making it work, though.

## Browserify

In 2011 the [Browserify](https://browserify.org/) project started with the goal of letting peope use CommonJS for the browser. Many Node.js modules like fs would not work in the browser - no filesystem - so Browserify would use a shim to approximate the behavior, where possible.

## AMD and require.js

Meanwhile, someone named James Burke had a different idea for a module system targeting the web primarily; [AMD](https://requirejs.org/docs/whyamd.html), or the Asynchronous Module Definition (AMD) API. He implemented a system to use AMD called [require.js](https://requirejs.org/).

It looks to address one of the issues with CommonJS for the web; their synchronous nature. AMD looks like this:

//Calling define with a dependency array and a factory function
define(['dep1', 'dep2'], function (dep1, dep2) {

    //Define the module value by returning a value.
    return function () {};
});

Notice the module returns a function; it's a factory function, that won't execute until dep1 and dep2 are loaded, which are loaded asynchronously; this is a good fit for the web, as not to lock up the main thread while your JavaScript modules load.

## Browserify, Node.js and npm

Since Browserify worked great with Node.js and CommonJS, and with Node.js becoming more and more popular on the server, along with the ability to easily manage dependencies with npm, Browserify gained more mindshare.

Browserify itself is small and simple, and relies on plugins to do most things. It's primary goal is bundling CommonJS for the web.

## Not Enough Standards

![](https://xkcd.com/927/)

Meanwhile, another module standard wad been explored: ES Modules. A summary of important events is [here](https://gist.github.com/jkrems/769a8cd8806f7f57903b641c74b5f08a). One of the important events was aroudn 2014, when WHATWG took over the ES Modules spec. It was destined to see inclusion in browsers. Finally, a native module system for browsers!

ES Modules, or esm, looks like this:

import { foo } from './bar'
export {
  foo,
  bar: () => 'bar'
}