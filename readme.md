# Static site generator

## Install

```bash
[sudo] npm install -g @mitjafelicijan/staticgen
```

## Initialize new project

```bash
mkdir demo-project
cd demo-project
staticgen --init
```

This will create basic folder structure and `staticgen.yml` file that holds global configuration.

### Folders

- assets → Holds your images (get copied to public/assets)
- static → Contains all the css etc files for your website (get copied to public/static)
- content → Holds markdown content files that get converted into html
- template → Twig templates (post.twig and index.twig)

### Meta attributes in markdown file

```
~ title: Lorem ipsum dolor sit amet
~ description: Duis ornare ut mauris vel dignissim
~ date: 2020-02-29
~ slug: /lorem-ipsum-dolor-sit-amet.html
~ template: post
~ hide: false

Content goes here ...
```

- If slug has sub-folders generator automatically creates sub-folders.
- Template looks for "{post}.twig" in template folder.
- Date is declared in YYYY-MM-DD format.
- Attribute hide is responsible for showing post in index or not.

## Generate static website

```bash
staticgen --generate
```

## Preview changes

I recommend using Browser Sync `[sudo] npm install -g browser-sync`.

```bash
browser-sync ./public/ -w --no-notify --no-open
```

## Host your website

The easiest way to get free reliable hosting is to use Firebase hosting.

1. Go to [Firebase console](https://console.firebase.google.com/) and create new project.
2. Install Firebase tool with `[sudo] npm install -g firebase-tools.`
3. Login to Firebase with `firebase login`.
4. Initialize project `firebase init` and select hosting and then use existing project and find your newly created one and then just press enter through all the options.
5. Deploy by executing `firebase deploy`.

You can also connect your own domain through web console. Firebase will take care of SSL for you.
