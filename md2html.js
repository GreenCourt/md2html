(function() {
  if(document.contentType != "text/markdown") return;
  const md = window.markdownit();
  md.use(window.markdownitKatex);

  // clear styles inserted by browser
  document.head.innerHTML = '';

  function render_math_codeblock() {
    document.querySelectorAll('pre code.language-math').forEach(elem => {
      const html = katex.renderToString(elem.innerText, {
        displayMode: true,
        output: 'html',
        throwOnError: false,
      });
      const span = document.createElement('span');
      span.innerHTML = html;
      elem.parentNode.replaceWith(span);
    })
  }

  // Load katex.min.css from web_accessible_resources.
  // The KaTeX fonts are also located in web_accessible_resources
  // and are accessed by a path relative to katex.min.css,
  // so katex.min.css must be loaded from web_accessible_resources.
  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', chrome.runtime.getURL("lib/katex/katex.min.css"));
  document.head.append(link)

  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    let lastModified = "";
    async function update() {
      const time = (await fetch(window.location.href, {"method":"HEAD", cache:"no-cache" })).headers.get('last-modified');
      if (lastModified != time) {
        lastModified = time;
        document.body.innerHTML = md.render(await (await fetch(location.href)).text());
        render_math_codeblock();
      }
    }
    update();
    setInterval(update, 1000);
  } else {
    // markdown is inserted into pre by browser.
    // <body><pre> markdown here </pre></body>
    document.body.innerHTML = md.render(document.querySelector('body > pre').textContent);
    render_math_codeblock();
  }
})();
