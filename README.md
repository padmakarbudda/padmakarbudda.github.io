# Padmakar Budda — portfolio

A responsive personal portfolio with projects, experience, skills, certifications, education, and custom sections.

Target public address: https://padmakarbudda.github.io/

## Publish on GitHub Pages

1. Name the repository `padmakarbudda.github.io`.
2. Open **Settings → Pages**.
3. Select **Deploy from a branch**, choose **main**, and choose **/(root)**.
4. Save and wait for the Pages deployment to finish.

The website files are at the repository root. No build or installation is needed. Keep the `.nojekyll` file. No paid domain is required for the GitHub Pages address.

## Update the content

Open `editor.html` through the website or a local web server. Add your real profile details and entries, choose **Preview draft**, then **Download content.js**. Replace `content.js` in this repository and commit the change.

The editor saves drafts only in your browser. Downloading a file does not publish it. Upload actual photos, project screenshots, or your résumé to `assets/`, then enter their relative paths in the editor.

Use **Sections & more** to hide, reorder, or add sections for awards, publications, volunteering, talks, and other work. The full guide is in `guide.html`.

Personal content currently includes the supplied name and GitHub link. Add your actual work history, projects, skills, credentials, and education in the editor; empty sections are labeled and can be hidden.

## Local preview

Run `python3 -m http.server 8000` in this directory, then open `http://localhost:8000`.

## Files

- `index.html`: main page and metadata.
- `content.js`: all personal content and section settings.
- `app.js`: portfolio rendering and interactions.
- `styles.css`: responsive styling.
- `editor.html`, `editor.js`: browser-local content authoring.
- `guide.html`: editing and publishing instructions.
- `assets/`: favicon and any images or documents you add.

Official setup documentation: https://docs.github.com/en/pages/quickstart
