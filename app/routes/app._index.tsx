import { ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate, useNavigation } from "@remix-run/react";
import { Badge, Link } from '@shopify/polaris';
import { authenticate } from "../shopify.server";
import { BlockStack, Button, ButtonGroup, Card, Divider, FooterHelp, InlineGrid, InlineStack, Layout, Page, Text } from "@shopify/polaris";
import { deleteProduct } from "~/server/services/deleteProduct";
import { deleteShopMetafield } from "~/server/services/deleteShopMetafield";
import { CheckIcon, DeleteIcon, EditIcon, EmailIcon, FlowerIcon, PlusIcon, OutboundIcon, ViewIcon, InboundIcon, ExitIcon, TextBlockIcon, QuestionCircleIcon } from "@shopify/polaris-icons";
import { FOXTAIL_NAMESPACE, STORE_METADATA_CUSTOM_PRODUCT_KEY } from "~/constants";
import { GET_SHOP_METAFIELD_BY_KEY_QUERY } from "~/server/graphql";
import { GET_PRODUCT_PREVIEW_BY_ID_QUERY } from "~/server/graphql/queries/product/getProductById";
import { useState } from "react";
import { SuccessBanner } from "~/components/SuccessBanner";
import { SettingsFormSkeleton } from "~/components/skeletons/SettingsFormSkeleton";
import { Product } from "node_modules/@shopify/shopify-api/dist/ts/rest/admin/2024-04/product";

type ManageProductProps = {
  onEditAction: () => void;
  onDeleteAction: () => void;
  onPreviewAction: () => void;
  onPublishAction: () => void;
  onUnpublishAction: () => void;
  productId: string | undefined | null;
  isPublished: boolean;
  isEditLoading: boolean;
  isDeleteLoading: boolean;
  // isPublishLoading: boolean;
};

type QuickstartProps = {
  onEditAction: () => void;
  productId: string | undefined | null;
  isEditLoading: boolean;
  isDeleteLoading: boolean;
};

type CurrentProductProps = {
  productId: string | undefined | null;
  onPreviewAction: () => void;
  isPublished: boolean;
};

type PublishButtonProps = {
  isPublished: boolean,
  onPublishAction: () => void;
  isDeleteLoading: boolean;
  isEditLoading: boolean;
  // isPublishLoading: boolean
}

type UnpublishButtonProps = {
  isPublished: boolean,
  onUnpublishAction: () => void;
  isDeleteLoading: boolean;
  isEditLoading: boolean;
  // isPublishLoading: boolean
}

type EditProps = {
  onEditAction: () => void;
  productId: string | undefined | null;
  isEditLoading: boolean;
  isDeleteLoading: boolean;
}

type LifecycleProps = {
  productId: string | undefined | null;
  onPublishAction: () => void;
  onUnpublishAction: () => void;
  onDeleteAction: () => void;
  isPublished: boolean;
  isDeleteLoading: boolean;
  isEditLoading: boolean;
  // isPublishLoading,
}

type ContainerProps = {
  header: string;
  body: string;
  action: JSX.Element;
}

type Product = {
  id: string | null;
  metafieldId: string;
  onlineStorePreviewUrl: string | undefined | null;
  onlineStoreUrl: string | undefined | null; // null if product isn't published to Online Store
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

const Welcome = () => {
  return (
    <Card roundedAbove="sm">
      <BlockStack gap="200">
        <Text as="h1" variant="headingLg">
          Welcome to FlowerFox
        </Text>
        <Text as="p" variant="bodyLg">
          Use our Template Editor to build a custom bouquet product in minutes.
        </Text>
      </BlockStack>
    </Card>
  )
};

const QuickStart = (
  {
    onEditAction,
    productId,
    isEditLoading,
    isDeleteLoading
  }: QuickstartProps) => {
  return (
    <Card roundedAbove="sm">
      <BlockStack gap="400">
        <Text as="h1" variant="headingLg">
          Getting Started
        </Text>
        <Card roundedAbove="sm">
          <InlineStack gap="200" align="space-between" blockAlign="center">
            <Text as="p" variant="bodyLg">
              1. Create a bouquet with the Template Editor
            </Text>
            <Button
              variant="primary"
              onClick={onEditAction}
              accessibilityLabel="Create or edit BYOB product"
              icon={!!(productId) ? CheckIcon : PlusIcon}
              loading={isEditLoading}
              disabled={!!(productId) || isEditLoading || isDeleteLoading}
            >
              {productId ? "Created" : "Create"}
            </Button>
          </InlineStack>
        </Card>
        <Card roundedAbove="sm">
          <Text as="p" variant="bodyLg">
            2. Manage your product below. It will be linked to the Template Editor until you disconnect it or delete it.
          </Text>
        </Card>

      </BlockStack>
    </Card>
  )
};

const CurrentProduct = (
  {
    productId,
    onPreviewAction
  }: CurrentProductProps) => {
  return (
    (!productId)
      ? <InlineStack gap="400">
        <Text as="h2" variant="headingMd" tone="critical">
          No bouquet linked to Template Editor. Create a new one to manage it.
        </Text>
      </InlineStack>
      : <InlineStack gap="400">
        <Text as="h2" variant="headingMd">
          Linked product:
        </Text>
        <Button
          onClick={onPreviewAction}
          accessibilityLabel="Preview BYOB product"
          icon={ViewIcon}
        >Preview</Button>
      </InlineStack>
  )
}

const PublishButton = (
  {
    isPublished,
    onPublishAction,
    isDeleteLoading,
    isEditLoading,
    // isPublishLoading
  }: PublishButtonProps
) => {
  return (
    <Button
      variant="primary"
      onClick={onPublishAction}
      accessibilityLabel="Publish"
      icon={OutboundIcon}
      // loading={isPublishLoading}
      disabled={isPublished || isDeleteLoading || isEditLoading
        // || isPublishLoading
      }
    >
      Publish
    </Button>
  )
}

const UnpublishButton = (
  {
    isPublished,
    onUnpublishAction,
    isDeleteLoading,
    isEditLoading,
    // isPublishLoading
  }: UnpublishButtonProps
) => {
  return (
    <Button
      variant="primary"
      onClick={onUnpublishAction}
      accessibilityLabel="Unpublish"
      icon={InboundIcon}
      // loading={isPublishLoading}
      disabled={!isPublished || isDeleteLoading || isEditLoading
        // || isPublishLoading
      }
    >
      Unpublish
    </Button>
  )
}

const Lifecycle = (
  {
    productId,
    isPublished,
    isDeleteLoading,
    isEditLoading,
    // isPublishLoading,
    onPublishAction,
    onUnpublishAction,
    onDeleteAction
  }: LifecycleProps) => {
  return (

    <InlineGrid gap="200" >
      <Divider />

      <Text as="h2" variant="headingMd">
        Manage Life Cycle
      </Text>

      <InlineGrid gap="400" columns={2}>

        <Card roundedAbove="sm">
          <BlockStack gap="200">
            <InlineGrid columns="1fr auto">
              <Text as="p" variant="bodyLg" fontWeight="bold" >
                Publish to Store
              </Text>
              <ButtonGroup>
                <PublishButton
                  isPublished={isPublished}
                  onPublishAction={onPublishAction}
                  isDeleteLoading={isDeleteLoading}
                  isEditLoading={isEditLoading}
                // isPublishLoading={isPublishLoading}
                />
                <UnpublishButton
                  isPublished={isPublished}
                  onUnpublishAction={onUnpublishAction}
                  isDeleteLoading={isDeleteLoading}
                  isEditLoading={isEditLoading}
                // isPublishLoading={isPublishLoading}
                />
              </ButtonGroup>
            </InlineGrid>
            <InlineStack gap="200">
              <Text as="p" variant="bodyLg" fontWeight="semibold">
                Status:
              </Text>
              {isPublished ? <Badge tone="success">Published</Badge> : <Badge tone="attention">Unpublished</Badge>}
            </InlineStack>
            <Text as="p" variant="bodyLg">
              When published, bouquet is offered in your online store.
            </Text>

          </BlockStack>
        </Card>

        <ManageContainer
          header="Delete Bouquet"
          body="Permanently delete bouquet."
          action={

            <Button
              variant="primary"
              tone="critical"
              onClick={onDeleteAction}
              accessibilityLabel="Delete BYOB product"
              icon={DeleteIcon}
              loading={isDeleteLoading}
              disabled={!productId || isDeleteLoading || isEditLoading}
            >
              Delete
            </Button>
          }
        />
      </InlineGrid>
    </InlineGrid>

  )
}

const ManageContainer = (
  {
    header,
    body,
    action,
  }: ContainerProps
) => {
  return (
    <Card roundedAbove="sm">
      <BlockStack gap="200">
        <InlineGrid columns="1fr auto">
          <Text as="p" variant="bodyLg" fontWeight="bold">
            {header}
          </Text>
          {action}
        </InlineGrid>

        <Text as="p" variant="bodyLg">
          {body}
        </Text>
      </BlockStack>
    </Card>
  )
}

const Edit = (
  {
    onEditAction,
    productId,
    isEditLoading,
    isDeleteLoading
  }: EditProps) => {
  return (

    <InlineGrid gap="400" >
      <Divider />

      <Text as="h2" variant="headingMd">
        Edit product
      </Text>

      <InlineGrid gap="400" columns={2}>
        <ManageContainer
          header="Use our Template Editor"
          body="Update selections, names, and prices with our simple form."
          action={
            <Button
              variant="primary"
              onClick={onEditAction}
              accessibilityLabel="Edit BYOB product"
              icon={EditIcon}
              loading={isEditLoading}
              disabled={!(productId) || isEditLoading || isDeleteLoading}
              fullWidth={false}
            >
              Edit
            </Button>
          }
        />

        <ManageContainer
          header="Make it your own."
          body="Disconnect your bouquet from the template editor.
              Recommended if you want to use the standard Shopify editor for deeper customization."
          action={
            <Button
              variant="primary"
              onClick={onEditAction}
              accessibilityLabel="Disconnect from template editor"
              icon={ExitIcon}
              loading={isEditLoading}
              disabled={!(productId) || isEditLoading || isDeleteLoading}
            >
              Disconnect
            </Button>
          }
        />
      </InlineGrid>
    </InlineGrid>

  )
}

const ManageProduct = (
  {
    onEditAction,
    onDeleteAction,
    onPreviewAction,
    productId,
    isPublished,
    isEditLoading,
    isDeleteLoading,
    // isPublishLoading,
    onPublishAction,
    onUnpublishAction
  }: ManageProductProps) => {
  return (
    <Card roundedAbove="sm">
      <BlockStack gap="400">
        <InlineGrid columns="1fr auto">
          <Text as="h1" variant="headingLg">
            Manage Bouquet
          </Text>
        </InlineGrid>

        <CurrentProduct productId={productId} isPublished={false} onPreviewAction={onPreviewAction} />

        {productId && <Edit onEditAction={onEditAction} productId={productId} isEditLoading={isEditLoading} isDeleteLoading={isDeleteLoading} />}

        {productId && <Lifecycle productId={productId} isPublished={isPublished} isEditLoading={isEditLoading} isDeleteLoading={isDeleteLoading}
          // isPublishLoading={isPublishLoading}
          onDeleteAction={onDeleteAction} onPublishAction={onPublishAction} onUnpublishAction={onUnpublishAction} />}

      </BlockStack>

    </Card>
  )
};

type ActionProps = {
  onAction: () => void;
};

const Foxtail = ({ onAction }: ActionProps) => (
  <Card roundedAbove="sm">
    <BlockStack gap="200">
      <InlineGrid columns="1fr auto">
        <Text as="h2" variant="headingLg">
          Latest News
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
        At Foxtail, we're dedicated to making custom orders easier. We're building online tools to
        make it easier for clients and florists to design together.
      </Text>
    </BlockStack>
  </Card>
);

const SupportContainer = (
  {
    header,
    body,
    action,
  }: ContainerProps
) => {
  return (
    <Card roundedAbove="sm">
      <BlockStack gap="400" align="space-between">
        <BlockStack gap="400">
          <Text as="p" variant="bodyMd" fontWeight="bold">
            {header}
          </Text>
          <Text as="p" variant="bodyMd">
            {body}
          </Text>

        </BlockStack>
        <InlineStack align="start" blockAlign="end">
          {action}
        </InlineStack>
      </BlockStack>
    </Card>
  )
}

const Support = ({ onAction }: ActionProps) => (
  <Card roundedAbove="sm">
    <BlockStack gap="400">
      <Text as="h2" variant="headingMd">
        Support
      </Text>
      <InlineGrid columns="3" gap="400">
        <SupportContainer
          header="Email Support"
          body="Run into an issue? Send us an email and we will get back to you as soon as possible."
          action={
            <Button
              onClick={onAction}
              accessibilityLabel="Email us with questions or feedback"
              icon={EmailIcon}
            >
              Email us
            </Button>
          }
        />
        <SupportContainer
          header="FAQ"
          body="Browse common questions and answers."
          action={
            <Button
              onClick={() => window.open("https://foxtailcreates.com/")?.focus()}
              accessibilityLabel="FAQ"
              icon={QuestionCircleIcon}
            >
              Go to FAQ
            </Button>
          }
        />
        <SupportContainer
          header="Help center"
          body="Find a solution to your problem via our tutorials and guides."
          action={
            <Button
              onClick={() => window.open("https://foxtailcreates.com/")?.focus()}
              accessibilityLabel="Help center"
              icon={TextBlockIcon}
            >
              Visit help center
            </Button>
          }
        />

      </InlineGrid>
    </BlockStack>
  </Card>
);

const Footer = () => {
  return (
    <FooterHelp>
      At Foxtail, we want to make it easy to design together.
      Learn more about {' '}
      <Link url="https://www.foxtailcreates.com">
        Foxtail.
      </Link>
    </FooterHelp>
  )
};

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
                  <InlineGrid gap="300" columns={['oneThird', 'twoThirds']}>
                    <Welcome />
                    <QuickStart
                      onEditAction={onEdit}
                      productId={product.id}
                      isEditLoading={isEditing}
                      isDeleteLoading={isDeleting}
                    />
                  </InlineGrid>
                </Layout.Section>
                <Layout.Section>
                  <ManageProduct
                    onPreviewAction={() => window.open(product.onlineStorePreviewUrl)?.focus()}
                    onEditAction={onEdit}
                    onDeleteAction={onDelete}
                    onPublishAction={() => function () { }}
                    onUnpublishAction={() => function () { }}
                    productId={product.id}
                    isPublished={!!product.onlineStoreUrl}
                    isEditLoading={isEditing}
                    isDeleteLoading={isDeleting}
                  // isPublishLoading={isPublishLoading}
                  />
                </Layout.Section>
                <Layout.Section>
                  <Support onAction={() => window.open("mailto:foxtailcreates@gmail.com?Subject=Hello")} />
                </Layout.Section>
                <Layout.Section>
                  <Foxtail onAction={() => window.open("https://foxtailcreates.com/")?.focus()} />
                </Layout.Section>
                <Layout.Section>
                  <Footer />
                </Layout.Section>
              </Layout>
            </Page>
          </>)
      }
    </>
  );
}
