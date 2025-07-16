# Regex Playground

An offline-friendly, visually interactive **Regular Expression tester** built for developers debugging regex on the fly. Works entirely in the browser using JavaScript’s native `RegExp` engine — **no backend**, **no tracking**, only instant regex results.

## Features

- **Live regex testing** with visual match and group display
- **Built-in regex snippets**: email, phone, date, IP, etc.
- Light/Dark theme toggle
- **Match result panel** with:
  - Match count
  - Start/end index
  - Capture group contents
- Exporting as JSON or plain text
- **Copy OR download** results
- Built using vanilla JS, HTML, CSS + Phosphor icons

## Contribute

- Regex patterns are stored in snippets.json
- Anyone can contribute new snippets!

```json
{
  "name": "Email Address",
  "description": "Matches basic emails like user@example.com",
  "pattern": "(\\w+)@(\\w+\\.\\w+)"
}
```

- You can also open an issue, submit a PR or suggest new features.
