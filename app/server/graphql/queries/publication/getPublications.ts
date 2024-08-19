export const GET_PUBLICATIONS_QUERY = `#graphql
  query getPublications {
    publications(first: 10, catalogType: APP) {
      nodes {
        id
        catalog {
          title
        }
      }
    }
  }`;
