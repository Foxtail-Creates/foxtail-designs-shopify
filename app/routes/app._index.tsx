import { ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate, useNavigation } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { BlockStack, Button, ButtonGroup, Card, InlineGrid, InlineStack, Layout, Page, Text } from "@shopify/polaris";
import { deleteProduct } from "~/server/services/deleteProduct";
import { deleteShopMetafield } from "~/server/services/deleteShopMetafield";
import { DeleteIcon, EditIcon, EmailIcon, FlowerIcon, PlusIcon, ViewIcon } from "@shopify/polaris-icons";
import { FOXTAIL_NAMESPACE, STORE_METADATA_CUSTOM_PRODUCT_KEY } from "~/constants";
import { GET_SHOP_METAFIELD_BY_KEY_QUERY } from "~/server/graphql";
import { GET_PRODUCT_PREVIEW_BY_ID_QUERY } from "~/server/graphql/queries/product/getProductById";
import { useState } from "react";
import { SuccessBanner } from "~/components/SuccessBanner";
import { SettingsFormSkeleton } from "~/components/skeletons/SettingsFormSkeleton";

type ByobProductProps = {
  onEditAction: () => void;
  onDeleteAction: () => void;
  onPreviewAction: () => void;
  productId: string | undefined | null;
  isEditLoading: boolean;
  isDeleteLoading: boolean;
  isBannerDismissed: boolean;
};

type Product = {
  id: string | null;
  metafieldId: string;
  onlineStorePreviewUrl: string | undefined | null;
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

export async function action({ request }: ActionFunctionArgs) {
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
  return json({ ok: true });
}

const ByobProduct = (
  {
    onEditAction,
    onDeleteAction,
    onPreviewAction,
    productId,
    isEditLoading,
    isDeleteLoading,
    isBannerDismissed,
  }: ByobProductProps) => (
  <Card roundedAbove="sm">
    <BlockStack gap="200">
      <InlineGrid columns="1fr auto">
        <Text as="h2" variant="headingMd">
          Build-Your-Own-Bouquet Product Generator
        </Text>
        {(!!productId && isBannerDismissed) &&
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
        Give your customers the option to buy a custom arrangement! Select the
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
            disabled={isEditLoading || isDeleteLoading}
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
        At Foxtail, we're turning floral design ideas into visual images early on in the design process.
        We’re building online tools to make it easier for clients and florists to understand what
        an order will look like, from color palettes to shape and style.
      </Text>
    </BlockStack>
  </Card>
);

const ContactUs = ({ onAction }: ActionProps) => (
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
  const fetcher = useFetcher();
  const product: Product = useLoaderData<typeof loader>();
  const nav = useNavigation();
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  const isEditing =
    nav.state === "loading" && nav.formMethod === undefined;

  const isDeleting = fetcher.state !== "idle";

  const onEdit = () => {
    navigate("bouquets/settings");
  };

  const onDelete = () => {
    fetcher.submit({ action: "delete", productId: product.id, metafieldId: product.metafieldId }, { method: "post" })
  };

  const showBanner = !isBannerDismissed && product.onlineStorePreviewUrl && nav.state === "idle";

  return (
    <>
      {isEditing && <SettingsFormSkeleton />}
      {!isEditing &&
        (
          <>
            <div
              className="square-color2"
              style={{ backgroundColor: "#F05F40", padding: "1rem" }}
            >
              <Text variant="heading2xl" as="h2" alignment="center" tone="text-inverse">
                Foxtail Designs
              </Text>
            </div>
            <Page>
              <Layout>
                <Layout.Section>
                  {showBanner && (
                    <SuccessBanner setIsDismissed={setIsBannerDismissed} previewLink={product.onlineStorePreviewUrl!} />
                  )}
                </Layout.Section>
                <Layout.Section>
                  <InlineGrid gap="300" columns={2}>
                    <ByobProduct
                      isBannerDismissed={isBannerDismissed}
                      onPreviewAction={() => window.open(product.onlineStorePreviewUrl)?.focus()}
                      onEditAction={onEdit}
                      onDeleteAction={onDelete}
                      productId={product.id}
                      isEditLoading={isEditing}
                      isDeleteLoading={isDeleting}
                    />
                    <Foxtail onAction={() => window.open("https://foxtailcreates.com/")?.focus()} />
                    <ContactUs onAction={() => window.open("mailto:foxtailcreates@gmail.com?Subject=Hello")} />
                  </InlineGrid>
                </Layout.Section>
              </Layout>
            </Page>
          </>)
      }
    </>
  );
}
