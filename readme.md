# Static site generator

## Installing

```bash
[sudo] npm install -g @mitjafelicijan/staticgen
```

## Initialize new project

```bash
cd your-project
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

## Hosting

The easiest way to get free reliable hosting is to use Firebase hosting.

1. Go to [Firebase console](https://console.firebase.google.com/) and create new project.
