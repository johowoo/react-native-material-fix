import { Layout } from "@components/layout";
import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import path from "path";
import Head from "next/head";
import ReactMarkdown from 'react-markdown'

const Code = (props) => {
  return (
    <div
      data-snack-code={props.children}
      data-snack-platform="web"
      data-snack-dependencies="@react-native-material/core"
      data-snack-preview="true"
      data-snack-theme="light"
      style={{
        height: "505px",
        width: "100%"
      }}
    />
  );
};


export default function post({ meta, md, listItems }) {
  return (
    <Layout components={listItems}>
      <Head>
        <title>{meta.title} | React Native Material</title>
        <meta name="description" content={meta.description} />
      </Head>
      <div style={{ maxWidth: 820 }}>
        <ReactMarkdown components={{ code: Code }}>
          {md}
        </ReactMarkdown>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  const paths = [];

  const folders = await readdir(path.resolve("./docs"));
  for (let index = 0; index < folders.length; index++) {
    const folder = folders[index];
    const files = await readdir(path.resolve("./docs", folder));
    files.forEach((slug) => {
      paths.push({ params: { folder, slug: slug.replace(".md", "") } });
    });
  }

  return {
    paths: paths,
    fallback: false
  };
}

export async function getStaticProps(ctx) {
  const listItems = [];

  const componentsPath = path.join("docs/components");
  const components = await readdir(componentsPath);
  for (let index = 0; index < components.length; index++) {
    const filename = components[index];
    const content = await readFile(
      path.join("docs/components", filename),
      "utf-8"
    );
    const { data: meta } = matter(content);
    listItems.push({ ...meta, slug: filename.replace(".md", "") });
  }

  const filePath = path.join(
    "docs",
    ctx.params.folder,
    `${ctx.params.slug}.md`
  );
  const content = await readFile(filePath, "utf-8");
  const { data: meta, content: md } = matter(content);

  return { props: { meta, md, listItems } };
}
