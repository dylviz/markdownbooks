import { summaryToUrlTree, UserFunction, UrlNode } from "mdxbook";
import GithubSlugger from 'github-slugger'
import visit from 'unist-util-visit'
import yaml from 'js-yaml'
import fs from 'fs'
import {hidRegex as detailsRegex} from './remark/withMCQ'

const hidRegex = /^<h[123]\s+hid="([^"]+)">(.+)(?=<\/h)/
//Let the user add a function
const userFunction: UserFunction  = (node: any, { mdast, frontMatter }) => {
  const routePrefix = node.route;
  var slugger = new GithubSlugger();
  let children = mdast.children
  const childrenTree = children
    .filter((child: any) => child.type === "html" && child.value.match(hidRegex))
    .map((child: any) => {
      const matches = child.value.match(hidRegex)
      return ({
          type: matches[0].slice(1,3),
          id: matches[1],
          title: matches[2],
          route: routePrefix + '#' + slugger.slug(matches[2])
        })
    }) //remove leading h1
  node.children = childrenTree;
};

const problemsFunction: UserFunction = (node: any, {mdast}) => {
  const routePrefix = node.route;
  const problems: any = []
  visit(mdast, "html", (hNode: any) => {
    const matches = hNode.value.match(detailsRegex)
    if (matches.length) {
      problems.push({
        type: "edtech-mcq",
        title: `Problem ${problems.length+1}`,
        id: matches[1],
        route: routePrefix + '#' + matches[1]
      })
    }
  })
  node.children = problems
}

const headersFunction: UserFunction = (node: any, { mdast, frontMatter}) => {
  const routePrefix = node.route;
  var slugger = new GithubSlugger();
  const headers: any[] = []
  visit(mdast, "heading", (node: any) => {
    if (node.depth === 2) {
      headers.push({
        type: "heading",
        title: node.children[0].value,
        route: routePrefix + '#' + slugger.slug(node.children[0].value)
      })
    }
  })
  node.children = headers
}

(async () => {
  const awsPractice = await summaryToUrlTree({
    url: "https://github.com/MatthewCaseres/aws-questions/blob/master/config.md",
    localPath: "/Users/matthewcaseres/Documents/GitHub/aws-questions/config.md",
    userFunction: problemsFunction
  })
  const iisTree = await summaryToUrlTree({
    url: "https://github.com/MatthewCaseres/mdExperiments/blob/main/IIS.md",
    localPath: "/Users/matthewcaseres/Documents/GitHub/mdExperiments/IIS.md"
  })
  const scsPlain = await summaryToUrlTree({
    url: "https://github.com/MatthewCaseres/omscs-notes-notes/blob/master/secure-computer-systems/00-table-of-contents.md",
    userFunction: headersFunction
  })
  const scsTree = await summaryToUrlTree({
    url: "https://github.com/MatthewCaseres/secure-computer-systems/blob/main/TOC.md",
    localPath: "/Users/matthewcaseres/Documents/GitHub/secure-computer-systems/TOC.md",
    userFunction
  })
  const mdxDocsTree = await summaryToUrlTree({
    url: "https://github.com/Open-EdTech/mdxbook/blob/main/DOCS/DOCS.md",
    localPath: "/Users/matthewcaseres/Documents/GitHub/mdxbook/DOCS/DOCS.md"
  })
  const basarat = await summaryToUrlTree({
    url: "https://github.com/basarat/typescript-book/blob/master/SUMMARY.md"
  })
  const awsS3 = await summaryToUrlTree({
    url: "https://github.com/MatthewCaseres/aws-docs-configs/blob/main/configs/amazon-s3-getting-started-guide.md"
  })
  fs.writeFileSync('bookConfig.json', JSON.stringify([awsPractice, iisTree, scsPlain, scsTree, mdxDocsTree, basarat, awsS3]))
})();


