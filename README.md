# git-log-to-markdown

> Aggregate git commit messages by day and convert to Markdown document.

## Reqiurement

- Git
- Node.js

## Usage

``` bash
$ cd my-repo
$ node ../git-log-to-markdown/ --user=MY_USER_NAME --output=OUTPUT_FILE_PATH
```
The markdown document looks like 

```
# 2016-11-11

 - My Commit 1
 - My Commit 2
 - My Commit 3

# 2016-11-12

 - My Commit 1
 - My Commit 2
 - My Commit 3

# 2016-11-13

 - My Commit 1
 - My Commit 2
 - My Commit 3

# 2016-11-14

 - My Commit 1
 - My Commit 2
 - My Commit 3

```

## License

[MIT](http://opensource.org/licenses/MIT)