import { json } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { Card, EmptyState, Layout, Page } from "@shopify/polaris";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

  return json({
    byobProducts: [],
  });
}

const EmptyByobProductsState = ({ onAction }) => (
  <EmptyState
    heading="Create a Build-Your-Own-Bouquet product"
    action={{
      content: "Create BYOB Product",
      onAction,
    }}
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>
      Give customers the option to buy a custom arrangement! Select the
      customizations you want to offer and generate all of the Shopify variants
      with one click.
    </p>
  </EmptyState>
);

export default function Index() {
  const navigate = useNavigate();

  return (
    <Page>
      {/* <ui-title-bar title="Build-Your-Own-Bouquet Product Customizer">
        <button variant="primary" onClick={() => navigate("/app/byob/new")}>
          Create a new BYOB Product
        </button>
      </ui-title-bar> */}
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <EmptyByobProductsState onAction={() => navigate("byob/new")} />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
