---
title: (翻译)GitHub.com前端移除jQuery库
date: 2018-09-08 06:42:30
categories:
- frentend
- news
tags: [Github, jQuery]
---
> 因本人能力有限，理解不到位，翻译内容可能存在偏差。如果可能，请尽量读[原文](https://githubengineering.com/removing-jquery-from-github-frontend/?utm_source=wanqu.co&utm_campaign=Wanqu+Daily&utm_medium=website)。

We have recently completed a milestone where we were able to drop jQuery as a dependency of the frontend code for GitHub.com. This marks the end of a gradual, years-long transition of increasingly decoupling from jQuery until we were able to completely remove the library. In this post, we will explain a bit of history of how we started depending on jQuery in the first place, how we realized when it was no longer needed, and point out that—instead of replacing it with another library or framework—we were able to achieve everything that we needed using standard browser APIs.

我们最近完成了一个里程碑，就是将jQuery从我们Github.com的前端依赖库中移了。直到完全移除了jQuery库才意味着一个逐步的、长达数年的去jQuery化的结束。在这篇文章中，我们会解释为一些历史，为什么我们一开始会引入jQuery，我们是何时意识到已经不再需要jQuery了，以及找出可替代它的类库或者框架，我需要使用浏览器的标准API来达到目的。

## 为什么jQuery之前是有用的（Why jQuery made sense early on）
GitHub.com pulled in [jQuery 1.2.1](https://blog.jquery.com/2007/09/16/jquery-1-2-1-released/) as a dependency in late 2007. For a bit of context, that was a year before Google released the first version of their Chrome browser. There was no standard way to query DOM elements by a CSS selector, no standard way to animate visual styles of an element, and the 【XMLHttpRequest interface](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) pioneered by Internet Explorer was, like many other APIs, inconsistent between browsers.

GitHub.com在2007年底时引入了[jQuery 1.2.1](https://blog.jquery.com/2007/09/16/jquery-1-2-1-released/)。因为这样的一些背景，当时距Google发布第一个版本还有一年时间。通过CSS选择器来查询DOM元素没有标准的方式，将元素视觉动画化也没有标准的样式，IE提供[XMLHttpRequest接口](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)，和其他API一样，在不同的浏览器之间也是不同。

jQuery made it simple to manipulate the DOM, define animations, and make “AJAX” requests— basically, it enabled web developers to create more modern, dynamic experiences that stood out from the rest. Most importantly of all, the JavaScript features built in one browser with jQuery would generally work in other browsers, too. In those early days of GitHub when most of its features were still getting fleshed out, this allowed the small development team to prototype rapidly and get new features out the door without having to adjust code specifically for each web browser.

jQuery使得操作DOM，定义动画，发起“AJAX”请求变得简单——基本上，它使Web开发人员能够创建出更现代、更动态的体验，这些体验在其他方面都非常突出。更为重要的是，使用了jQuery的JavaScript特性在不同的浏览器都可正常工作。在GitHub早期，它的大部分功能还在不断充实，这使得小型开发团队能够快速地进行原型，而无需为每个Web浏览器专门调整代码来实现新的特性。

The simple interface of jQuery also served as a blueprint to craft extension libraries that would later serve as building blocks for the rest of GitHub.com frontend: [pjax](https://github.com/defunkt/jquery-pjax) and [facebox](https://github.com/defunkt/facebox).

jQuery的简单接口为设计扩展库提供了蓝图，GitHub.com扩展前端的基础模块： [pjax](https://github.com/defunkt/jquery-pjax)和[facebox](https://github.com/defunkt/facebox)。

We will always be thankful to John Resig and the jQuery contributors for creating and maintaining such a useful and, for the time, essential library.

我们将一直感激John Resig和jQuery的贡献者创建和维护了这样一个有用的，对于当时来说，必不可少的类库。

## 近年来的Web标准（Web standards in the later years）
Over the years, GitHub grew into a company with hundreds of engineers and a dedicated team gradually formed to take responsibility for the size and quality of JavaScript code that we serve to web browsers. One of the things that we’re constantly on the lookout for is technical debt, and sometimes technical debt grows around dependenices that once provided value, but whose value dropped over time.

这些年来，Github成长为一家拥有数百名工程师的公司，并逐渐形成了一只专门负责我们运行在Web浏览器上的JavaScript代码的大小和质量的团队。其中一件我们一直在做的事情就是找出技术债务，有时技术债务会随着曾经提供价值的附属物而增长，但其价值会随着时间的推移而下降。

When it came to jQuery, we compared it against the rapid evolution of supported web standard in modern browsers and realized:

The $(selector) pattern can easily be replaced with querySelectorAll();
CSS classname switching can now be achieved using Element.classList;
CSS now supports defining visual animations in stylesheets rather than in JavaScript;
$.ajax requests can be performed using the Fetch Standard;
The addEventListener() interface is stable enough for cross-platform use;
We could easily encapsulate the event delegation pattern with a lighweight library;
Some syntactic sugar that jQuery provides has become reduntant with the evolution of JavaScript language.
Furthermore, the chaining syntax didn’t satisfy how we wanted to write code going forward. For example:

$('.js-widget')
  .addClass('is-loading')
  .show()
This syntax is simple to write, but to our standards, doesn’t communicate intent really well. Did the author expect one or more js-widget elements on this page? Also, if we update our page markup and accidentally leave out the js-widget classname, will an exception in the browser inform us that something went wrong? By default, jQuery silently skips the whole expresion when nothing matched the initial selector; but to us, such behavior was a bug rather than a feature.

Finally, we wanted to start annotating types with Flow to perform static type checking at build time, and we concluded that the chaining syntax doesn’t lend itself well to static analysis, since almost every result of a jQuery method call is of the same type. We chose Flow over alternatives because, at the time, features such as @flow weak mode allowed us to progressively and efficiently start applying types to a codebase which was largely untyped.

All in all, decoupling from jQuery would mean that we could rely on web standards more, have MDN web docs be de-facto default documentation for our frontend developers, maintain more resilient code in the future, and eventually drop a 30 kB dependency from our packaged bundles, speeding up page load times and JavaScript execution times.

Incremental decoupling
Even with an end goal in sight, we knew that it wouldn’t be feasible to just allocate all resources we had to rewriting everything from jQuery to vanilla JS. If anything, such a rushed endeavor would likely lead to many regressions in site functionality that we would later have to weed out. Instead, we:

Set up metrics that tracked ratio of jQuery calls used per overall line of code and monitored that graph over time to make sure that it’s either staying constant or going down, not up.

Graph of jQuery usage going down over time.

We discouraged importing jQuery in any new code. To facilitate that using automation, we created eslint-plugin-jquery which would fail CI checks if anyone tried to use jQuery features, for example $.ajax.

There were now plenty of violations of eslint rules in old code, all of which we’ve annotated with specific eslint-disable rules in code comments. To the reader of that code, those comments would serve as a clear signal that this code doesn’t represent our current coding practices.

We created a pull request bot that would leave a review comment on a pull request pinging our team whenever somebody tried to add a new eslint-disable rule. This way we would get involved in code review early and suggest alternatives.

A lot of old code had explicit coupling to external interfaces of pjax and facebox jQuery plugins, so we’ve kept their interfaces relatively the same while we’ve internally replaced their implementation with vanilla JS. Having static type checking helped us have greater confidence around those refactorings.

Plenty of old code interfaced with rails-behaviors, our adapter for the Ruby on Rails approach to “unobtrusive” JS, in a way that they would attach an AJAX lifecycle handler to certain forms:

  // LEGACY APPROACH
  $(document).on('ajaxSuccess', 'form.js-widget', function(event, xhr, settings, data) {
    // insert response data somewhere into the DOM
  })
Instead of having to rewrite all of those call sites at once to the new approach, we’ve opted to trigger fake ajax* lifecycle events and keep these forms submitting their contents asynchronously as before; only this time fetch() was used internally.

We maintained a custom build of jQuery and whenever we’ve identified that we’re not using a certain module of jQuery anymore, we would remove it from the custom build and ship a slimmer version. For instance, after we have removed the final usage of jQuery-specific CSS pseudo-selectors such as :visible or :checkbox, we were able to remove the Sizzle module; and when the last $.ajax call was replaced with fetch(), we were able to remove the AJAX module. This served a dual purpose: speeding up JavaScript execution times while at the same time ensuring that no new code is created that would try using the removed functionality.

We kept dropping support for old Internet Explorer versions as soon as it would be feasible to, as informed by our site analytics. Whenever use of a certain IE version dropped below a certain treshold, we would stop serving JavaScript to it and focus on testing against and supporting more modern browsers. Dropping support for IE 8–9 early on allowed us to adopt many native browser features that would otherwise be hard to polyfill.

As part of our refined approach to building frontend features on GitHub.com, we focused on getting away with regular HTML foundation as much as we could, and only adding JavaScript behaviors as progressive enhancement. As a result, even those web forms and other UI elements that were enhanced using JS would usually also work with JavaScript disabled in the browser. In some cases, we were able to delete certain legacy behaviors altogether instead of having to rewrite them in vanilla JS.

With these and similar efforts combined over the years, we were able gradually reduce our dependence on jQuery until there was not a single line of code referencing it anymore.

Custom Elements
One technology that has been making waves in the recent years is Custom Elements: a component library native to the browser, which means that there are no additional bytes of a framework for the user to download, parse and compile.

We had created a few Custom Elements based on the v0 specification since 2014. However, as standards were still in flux back then, we did not invest as much. It was not until 2017 when the Web Components v1 spec was released and implemented in both Chrome and Safari that we began to adopt Custom Elements on a wider scale.

During the jQuery migration, we looked for patterns that would be suitable for extraction as custom elements. For example, we converted our facebox usage for displaying modal dialogs to the <details-dialog> element.

Our general philosophy of striving for progressive enhancement extends to custom elements as well. This means that we keep as much of the content in markup as possible and only add behaviors on top of that. For example, <local-time> shows the raw timestamp by default and gets upgraded to translate the time to the local timezone, while <details-dialog>, when nested in the <details> element, is interactive even without JavaScript, but gets upgraded with accessibility enhancements.

Here is an example of how a <local-time> custom element could be implemented:

// The local-time element displays time in the user's current timezone
// and locale.
//
// Example:
//   <local-time datetime="2018-09-06T08:22:49Z">Sep 6, 2018</local-time>
//
class LocalTimeElement extends HTMLElement {
  static get observedAttributes() {
    return ['datetime']
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName === 'datetime') {
      const date = new Date(newValue)
      this.textContent = date.toLocaleString()
    }
  }
}

if (!window.customElements.get('local-time')) {
  window.LocalTimeElement = LocalTimeElement
  window.customElements.define('local-time', LocalTimeElement)
}

One aspect of Web Components that we’re looking forward to adopting is Shadow DOM. The powerful nature of Shadow DOM has the potential to unlock a lot of possibilities for the web, but that also makes it harder to polyfill. Because polyfilling it today incurs a performance penalty even for code that manipulates parts of the DOM unrelated to web components, it is unfeasible for us to start using it in production.

Polyfills
These are the polyfills that helped us transition to using standard browser features. We try to serve most of these polyfills only when absolutely necessary, i.e. to outdated browsers as part of a separate “compatibility” JavaScript bundle.

- [github/eventlistener-polyfill](https://github.com/github/eventlistener-polyfill#readme)
- [github/fetch](https://github.com/github/fetch#readme)
- [github/form-data-entries](https://github.com/github/form-data-entries#readme)
- [iamdustan/smoothscroll](https://github.com/iamdustan/smoothscroll#readme)
- [javan/details-element-polyfill](https://github.com/javan/details-element-polyfill#readme)
- [jonathantneal/closest](https://github.com/jonathantneal/closest#readme)
- [kumarharsh/custom-event-polyfill](https://github.com/kumarharsh/custom-event-polyfill#readme)
- [marvinhagemeister/request-idle-polyfill](https://github.com/marvinhagemeister/request-idle-polyfill#readme)
- [mathiasbynens/Array.from](https://github.com/mathiasbynens/Array.from#readme)
- [mathiasbynens/String.prototype.codePointAt](https://github.com/mathiasbynens/String.prototype.codePointAt#readme)
- [mathiasbynens/String.prototype.endsWith](https://github.com/mathiasbynens/String.prototype.endsWith#readme)
- [mathiasbynens/String.prototype.startsWith](https://github.com/mathiasbynens/String.prototype.startsWith#readme)
- [medikoo/es6-symbol](https://github.com/medikoo/es6-symbol#readme)
- [nicjansma/usertiming.js](https://github.com/nicjansma/usertiming.js#readme)
- [rubennorte/es6-object-assign](https://github.com/rubennorte/es6-object-assign#readme)
- [stefanpenner/es6-promise](https://github.com/stefanpenner/es6-promise#readme)
- [webcomponents/template](https://github.com/webcomponents/template#template)
- [webcomponents/URL](https://github.com/webcomponents/URL#readme)
- [webcomponents/webcomponentsjs](https://github.com/webcomponents/webcomponentsjs#readme)
- [WebReflection/url-search-params](https://github.com/WebReflection/url-search-params#readme)
- [yola/classlist-polyfill](https://github.com/yola/classlist-polyfill#readme)


