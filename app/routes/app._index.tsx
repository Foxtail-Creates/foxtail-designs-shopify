import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { BlockStack, Button, ButtonGroup, Card, InlineGrid, InlineStack, Layout, Page, Text } from "@shopify/polaris";
import { deleteProduct } from "~/server/deleteProduct";
import { deleteShopMetafield } from "~/server/deleteShopMetafield";
import { DeleteIcon, EditIcon, EmailIcon, FlowerIcon, PlusIcon, ViewIcon } from "@shopify/polaris-icons";
import { FOXTAIL_NAMESPACE, STORE_METADATA_CUSTOM_PRODUCT_KEY } from "~/constants";
import { GET_SHOP_METAFIELD_BY_KEY_QUERY } from "~/server/graphql";
import { useState } from "react";
import { GET_PRODUCT_PREVIEW_BY_ID_QUERY } from "~/server/graphql/queries/product/getProductById";

type ByobProductProps = {
  onEditAction: () => void;
  onDeleteAction: () => void;
  onPreviewAction: () => void;
  productId: string | undefined | null;

  isEditLoading: boolean;
  isDeleteLoading: boolean;
};

type Product = {
  id: string | null;
  metafieldId: string;
  onlineStorePreviewUrl: string | undefined;
};

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const getShopMetadataResponse = await admin.graphql(
    GET_SHOP_METAFIELD_BY_KEY_QUERY,
    {
      variables: {
        namespace: FOXTAIL_NAMESPACE,
        key: STORE_METADATA_CUSTOM_PRODUCT_KEY,
      },
    },
  );
  const shopMetadataBody = await getShopMetadataResponse.json();

  const productId = shopMetadataBody.data?.shop.metafield?.value;

  let productPreviewUrl = null;

  if (productId) {
    const customProductResponse = await admin.graphql(
      GET_PRODUCT_PREVIEW_BY_ID_QUERY,
      {
        variables: {
          id: productId
        },
      },
    );
    productPreviewUrl = (await customProductResponse.json())?.data?.product?.onlineStorePreviewUrl;
  }

  return json({
    id: productId,
    metafieldId: shopMetadataBody.data?.shop.metafield?.id,
    onlineStorePreviewUrl: productPreviewUrl
  });
}

export async function action({ request, params }) {
  const { admin } = await authenticate.admin(request);
  const data = {
    ...Object.fromEntries(await request.formData()),
  };
  if (data.action === "delete") {
    // delete product
    if (data.productId != "undefined") {
      await deleteProduct(admin, data.productId);
    }

    // delete shop metafield
    if (data.metafieldId != "undefined") {
      await deleteShopMetafield(admin, data.metafieldId)
    }
  }
  return redirect(`/app`);
}

const ByobProduct = (
  {
    onEditAction,
    onDeleteAction,
    onPreviewAction,
    productId,
    isEditLoading,
    isDeleteLoading
  }: ByobProductProps) => (
  <Card roundedAbove="sm">
    <BlockStack gap="200">
      <InlineGrid columns="1fr auto">
        <Text as="h2" variant="headingMd">
          Build-Your-Own-Bouquet
        </Text>
        {(!!productId) &&
          <Button
            onClick={onPreviewAction}
            accessibilityLabel="Preview BYOB product"
            icon={ViewIcon}
          >
            Preview
          </Button>
        }
      </InlineGrid>
      <Text as="p" variant="bodyMd">
        Give customers the option to buy a custom arrangement! Select the
        customizations you want to offer and generate all of the Shopify variants
        with a few clicks.
      </Text>
      <InlineStack align="end">
        <ButtonGroup>
          {(!!productId) &&
            <Button
              variant="secondary"
              onClick={onDeleteAction}
              accessibilityLabel="Delete BYOB product"
              icon={DeleteIcon}
              loading={isDeleteLoading}
              disabled={isDeleteLoading || isEditLoading}
            >
              Delete
            </Button>
          }
          <Button
            variant="primary"
            onClick={onEditAction}
            accessibilityLabel="Create or edit BYOB product"
            icon={(!productId) ? PlusIcon : EditIcon}
            loading={isEditLoading}
            disabled={isEditLoading} // todo: figure out how to add isDeleteLoading
          >
            {(!productId) ? 'Create' : 'Edit'}
          </Button>
        </ButtonGroup>
      </InlineStack>
    </BlockStack>
  </Card>
);

type ActionProps = {
  onAction: () => void;
};

const Foxtail = ({ onAction }: ActionProps) => (
  <Card roundedAbove="sm">
    <BlockStack gap="200">
      <InlineGrid columns="1fr auto">
        <Text as="h2" variant="headingMd">
          Foxtail Designs
        </Text>
        <Button
          onClick={onAction}
          accessibilityLabel="Visit Foxtail Designs to learn more"
          icon={FlowerIcon}
        >
          Learn more
        </Button>
      </InlineGrid>
      <Text as="p" variant="bodyMd">
        At Foxtail, we turn floral design ideas into visual images early on in the design process.
        We’re building online tools to make it easier for clients and florists to understand what
        an order will look like, from color palettes to shape and style.
      </Text>
    </BlockStack>
  </Card>
);

const ContactUs = ({ onAction }: ActionProps ) => (
  <Card roundedAbove="sm">
    <BlockStack gap="200">
      <InlineGrid columns="1fr auto">
        <Text as="h2" variant="headingMd">
          Contact Us
        </Text>
        <Button
          onClick={onAction}
          accessibilityLabel="Email us with questions or feedback"
          icon={EmailIcon}
        >
          Contact
        </Button>
      </InlineGrid>
      <Text as="p" variant="bodyMd">
        Run into an issue? Have questions? Send us an email and we will get back to you as soon as possible.
      </Text>
    </BlockStack>
  </Card>
);

export default function Index() {
  const navigate = useNavigate();
  const submit = useSubmit();
  const product: Product = useLoaderData();

  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const onEdit = () => {
    setIsEditLoading(true);
    navigate("bouquets/settings")
  };

  const onDelete = () => {
    setIsDeleteLoading(true);
    submit({ action: "delete", productId: product.id, metafieldId: product.metafieldId }, { method: "post" })
  };

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <InlineGrid gap="300" columns={2}>
            <ByobProduct
              onPreviewAction={() => window.open(product.onlineStorePreviewUrl)?.focus()}
              onEditAction={onEdit}
              onDeleteAction={onDelete}
              productId={product.id}
              isEditLoading={isEditLoading}
              isDeleteLoading={isDeleteLoading}
            />
            <Foxtail onAction={() => window.open("https://foxtailcreates.com/")?.focus()} />
            <ContactUs onAction={() => window.open("mailto:foxtailcreates@gmail.com?Subject=Hello")} />
          </InlineGrid>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
