#!/usr/bin/env node

'use strict';

const FS = require('fs');
const FSE = require('fs-extra');
const OS = require('os');
const Path = require('path');
const Showdown = require('showdown');
const YAML = require('yaml');
const Twig = require('twig');
const Feed = require('feed').Feed;
const Program = require('commander');
const Unzipper = require('unzipper');

global.homeDirectory = OS.homedir();
global.scriptDirectory = __dirname;
global.workingDirectory = process.cwd();

Program
  .version('0.1.0')
  .option('--init', 'initializes new empty project')
  .option('--generate', 'generates website from content')
  .parse(process.argv);


if (Program.init) {
  console.log('> Extracting empty project into current folder ...');
  FS.createReadStream(`${scriptDirectory}/empty-project.zip`).pipe(Unzipper.Extract({ path: workingDirectory }));
};

if (Program.generate) {

  // parses config file
  let config = null;
  try {
    config = YAML.parse(FS.readFileSync(`${workingDirectory}/staticgen.yml`, 'utf8'));
  } catch (error) {
    console.log('staticgen.yml does not exist');
    console.log('user "staticgen --init" to initialize new project');
    process.exit(1);
  }

  console.log('> Config:', config);

  const Converter = new Showdown.Converter({
    tables: true,
    emoji: true,
  });

  // code highlighting block

  config.highlight = `
    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/styles/${config.highlightStye}.min.css">
    <script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/highlight.min.js"></script>
    <script>hljs.initHighlightingOnLoad();</script>`;

  config.ga = `
    <script async="async" src="https://www.googletagmanager.com/gtag/js?id=${config.ga}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', '${config.ga}');
    </script>`;

  const parseMarkdownContentFile = (source) => {
    let options = {};
    let content = [];

    for (const line of source.split('\n')) {
      if (line.trim().charAt(0) === '~') {
        try {
          const keyValuePair = line.replace('~', '').trim().split(':')
          options[keyValuePair[0]] = keyValuePair[1].trim();
        } catch (error) {
          console.log(error);
        }
      } else {
        content.push(line);
      }
    }

    return {
      options,
      content: content.join('\n'),
    };
  }

  const searchRecursive = (dir, pattern) => {
    let results = [];
    FS.readdirSync(dir).forEach(function (dirInner) {
      dirInner = Path.resolve(dir, dirInner);

      let stat = FS.statSync(dirInner);
      if (stat.isDirectory()) {
        results = results.concat(searchRecursive(dirInner, pattern));
      }

      if (stat.isFile() && dirInner.endsWith(pattern)) {
        results.push(dirInner);
      }
    });
    return results;
  };

  // generates html from markdown files

  let indexList = [];

  for (const contentFile of searchRecursive(`${workingDirectory}/${config.content}`, '.md')) {
    const content = FS.readFileSync(contentFile, 'utf8');
    const markdown = parseMarkdownContentFile(content);
    const html = Converter.makeHtml(markdown.content);

    // cleaning slashes
    let publicDir = config.public;
    if (publicDir.endsWith('/')) {
      publicDir = publicDir.slice(0, -1);
    }

    const targetDirPath = `${workingDirectory}/${config.public.endsWith('/') ? config.public.slice(0, -1) : config.public}${Path.dirname(markdown.options.slug)}`;
    const targetFilename = `${targetDirPath}/${Path.basename(markdown.options.slug)}`;

    // creates subfolders
    FS.mkdirSync(targetDirPath, { recursive: true });

    console.log('> Generating file with options:', markdown.options)

    try {
      // renders and write html to file
      Twig.renderFile(`${workingDirectory}/${config.templates}${markdown.options.template}.twig`, {
        options: markdown.options,
        global: config,
        content: html,
      }, (err, html) => {
        FS.writeFileSync(targetFilename, html);
      });
    } catch (error) {
      console.log(error);
    }

    if (markdown.options.hide !== 'true') {
      markdown.options.html = html;
      indexList.push(markdown.options);
    }
  }

  // sort index list

  indexList.sort(function (a, b) {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    return 0;
  }).reverse();

  // generates index file

  Twig.renderFile(`${workingDirectory}/${config.templates}index.twig`, {
    global: config,
    list: indexList,
  }, (err, html) => {
    FS.writeFileSync(`${workingDirectory}/${config.public}index.html`, html);
  });

  // copy static files

  try {
    console.log('> Copying static files ...');
    FSE.copySync(`${workingDirectory}/${config.static}`, `${workingDirectory}/${config.public}${config.static}`);
  } catch (error) {
    console.log(error);
  }

  // copy assets like images etc

  try {
    console.log('> Copying asset files ...');
    FSE.copySync(`${workingDirectory}/${config.assets}`, `${workingDirectory}/${config.public}${config.assets}`);
  } catch (error) {
    console.log(error);
  }

  // creates atom feed

  const feed = new Feed({
    title: config.author,
    description: config.description,
    id: config.domain,
    link: config.domain,
    author: {
      name: config.author,
      email: config.email,
    }
  });

  for (const item of indexList) {
    feed.addItem({
      title: item.title,
      id: `${config.domain}${item.slug}`,
      link: `${config.domain}${item.slug}`,
      description: item.description,
      content: item.html,
      date: new Date(item.date),
    });
  }

  console.log('> Generating atom feed ...');
  FS.writeFileSync(`${workingDirectory}/${config.public}feed.atom`, feed.atom1());
};
