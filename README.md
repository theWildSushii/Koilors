[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/O4O4QIF53)
# Koilors
### Perceptually uniform color scheme designer.
**Generate beautiful color palettes by picking just one color.**

[Click here to open web app](https://thewildsushii.github.io/Koilors/)


## How to install and run
Clone or download this repo and use any simple HTTP server you like, there's no need for any building as this is written in good ol' plain HTML/JavaScript.

*Note: You could simply open the `index.html` file in your browser without using any HTTP server. However, the color picker rendering won't work because it relies on web workers.*

### Examples
#### Using Node.js
Install `http-server`
```
npm install --global http-server
```
Then
```
cd [path-to-repo]
http-server
```
Or run without installing anything
```
npx http-server [path-to-repo]
```
#### Using Python 2
```
cd [path-to-repo]
python -m SimpleHTTPServer
```
#### Using Python 3
```
cd [path-to-repo]
python -m http.server
```


## Credits
* The amazing devs that made [Color.js](https://github.com/LeaVerou/color.js)
* [Björn Ottosson](https://github.com/bottosson) for making Oklab, Okhsv and Okhsl