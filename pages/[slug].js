import React from "react";
import { fetchAPI } from "../lib/api";
import Article from "../src/components/Article";
import transformLinks from "../src/utils/transformLinks";

const FallbackRenderer = ({ article, navLinks }) => {
  return <Article article={article} navLinks={navLinks} />;
};

export async function getStaticPaths() {
  const { data } = await fetchAPI("/website/blog/slugs");

  return {
    paths: (data || []).map((slug) => ({
      params: { slug },
      // TODO: Should all locales be pre-generated?
      locale: "en",
    })),
    fallback: true,
  };
}

export async function getStaticProps({ params, locale }) {
  // TODO: Do something for rate-limit
  const { data } = await fetchAPI(`/website/blog/${locale}/${params.slug}`);
  const navRes = await fetchAPI("/website-nav-links", {
    populate: {
      links: {
        populate: "*",
      },
    },
  });

  const navLinks = transformLinks(navRes.data);

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      article: data,
      navLinks,
    },
    revalidate: 5 * 60, // Cache response for 5m
  };
}

export default FallbackRenderer;
