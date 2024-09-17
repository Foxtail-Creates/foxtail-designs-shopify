import { ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate, useNavigation } from "@remix-run/react";
import { Badge, Box, Link } from '@shopify/polaris';
import { authenticate } from "../shopify.server";
import { BlockStack, Button, ButtonGroup, Card, Divider, FooterHelp, InlineGrid, InlineStack, Layout, Page, Text } from "@shopify/polaris";
import { deleteProduct } from "~/server/services/deleteProduct";
import { deleteMetafield } from "~/server/services/deleteMetafield";
import { CheckIcon, DeleteIcon, EditIcon, EmailIcon, FlowerIcon, PlusIcon, OutboundIcon, ViewIcon, InboundIcon, ExitIcon, TextBlockIcon, QuestionCircleIcon } from "@shopify/polaris-icons";
import { useState } from "react";
import { SuccessBanner } from "~/components/SuccessBanner";
import { SettingsFormSkeleton } from "~/components/skeletons/SettingsFormSkeleton";
import { getProductPreview } from "~/server/services/getProductPreview";
import { getShopWithMetafield } from "~/server/services/getShopMetafield";
import { publishProductInOnlineStore } from "~/server/controllers/activateProductInOnlineStore";
import { unpublishProductInOnlineStore } from "~/server/controllers/unpublishProductInOnlineStore";
import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { SETTINGS_PATH } from "~/constants";
import { trackEvent } from "~/server/services/sendEvent";
import { DELETE_PRODUCT_EVENT, DETACH_PRODUCT_EVENT, PUBLISH_PRODUCT_EVENT } from "~/analyticsKeys";
import { getShopDomain }  from "~/utils";
import { ProductStatus } from "~/types/admin.types";
import header_png from "../assets/foxtail_header_asset_sm.png";

type ManageProductProps = {
  onEditAction: () => void;
  onDisconnectAction: () => void;
  onDeleteAction: () => void;
  onPreviewAction: () => void;
  onPublishAction: () => void;
  onUnpublishAction: () => void;
  productId: string | undefined | null;
  isPublished: boolean;
  isEditLoading: boolean;
  isDeleteLoading: boolean;
  isDisconnectLoading: boolean;
  isPublishLoading: boolean;
};

type QuickstartProps = {
  onEditAction: () => void;
  onPublishAction: () => void;
  productId: string | undefined | null;
  isPublished: boolean;
  isEditLoading: boolean;
  isDeleteLoading: boolean;
  isPublishLoading: boolean;
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
  isPublishLoading: boolean
}

type UnpublishButtonProps = {
  isPublished: boolean,
  onUnpublishAction: () => void;
  isDeleteLoading: boolean;
  isEditLoading: boolean;
  isPublishLoading: boolean
}

type EditProps = {
  onEditAction: () => void;
  onDisconnectAction: () => void;
  productId: string | undefined | null;
  isEditLoading: boolean;
  isDeleteLoading: boolean;
}

type LifeCycleProps = {
  productId: string | undefined | null;
  onPublishAction: () => void;
  onUnpublishAction: () => void;
  onDeleteAction: () => void;
  isPublished: boolean;
  isDeleteLoading: boolean;
  isEditLoading: boolean;
  isPublishLoading: boolean;
}

type ContainerProps = {
  header: string;
  body: string;
  action: JSX.Element;
}

type AppSettings = {
  productId: string | undefined | null;
  shopId: string;
  shopMetafieldId: string | undefined | null;
  productMetafieldId: string | undefined | null;
  onlineStorePreviewUrl: string | undefined | null;
  publishedAt: string | undefined | null; // null if product isn't published to Online Store
  status: ProductStatus | undefined | null;
};

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const shopWithMetafield = await getShopWithMetafield(admin);
  const productId = shopWithMetafield.metafield?.value;

  let productPreviewUrl = null;
  let publishedAt = null;
  let status = null;
  let metafieldId = null;

  if (productId) {
    const product = await getProductPreview(admin, productId);
    productPreviewUrl = product?.onlineStorePreviewUrl;
    publishedAt = product?.publishedAt;
    status = product?.status;
    metafieldId = product?.metafield?.id;
  }

  const appSettings: AppSettings = {
    productId: productId,
    shopMetafieldId: shopWithMetafield.metafield?.id,
    shopId: shopWithMetafield.id,
    productMetafieldId: metafieldId,
    onlineStorePreviewUrl: productPreviewUrl,
    publishedAt: publishedAt,
    status: status
  };

  return json(appSettings);
}

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const domain:string = getShopDomain(session.shop); // remove ".myshopify.com" from domain
  const data = {
    ...Object.fromEntries(await request.formData()),
  };
  if (data.action === "delete") {
    // delete product
    if (data.productId !== "undefined" && data.productId !== "null") {
      await deleteProduct(admin, data.productId);
    }

    // delete shop metafield
    if (data.shopMetafieldId !== "undefined" && data.shopMetafieldId !== "null") {
      await deleteMetafield(admin, data.shopMetafieldId);
    }
    trackEvent({
      storeId: domain,
      eventName: DELETE_PRODUCT_EVENT,
      properties: {}
    });
  } else if (data.action === "disconnect") {
    // delete shop metafield
    if (data.shopMetafieldId !== "undefined" && data.shopMetafieldId !== "null") {
      await deleteMetafield(admin, data.shopMetafieldId);
    }
    if (data.metafieldId && data.metafieldId !== "undefined" && data.metafieldId !== "null") {
      await deleteMetafield(admin, data.metafieldId);
    }
    trackEvent({
      storeId: domain,
      eventName: DETACH_PRODUCT_EVENT,
      properties: {}
    });
  } else if (data.action === "publish") {
    if (data.productId) {
      await publishProductInOnlineStore(admin, data.productId, data.publishedAt, data.status);
      trackEvent({
        storeId: domain,
        eventName: PUBLISH_PRODUCT_EVENT,
        properties: {}
      });
    }
  } else if (data.action === "unpublish") {
    if (data.productId) {
      await unpublishProductInOnlineStore(admin, data.productId, data.publishedAt);
    }
  }
  return json({ ok: true });
}

const Welcome = () => {
  return (
    <Card roundedAbove="sm">
      <BlockStack gap="200">
        <Text as="h1" variant="headingLg">
          Welcome to Foxtail's Custom Bouquet Template
        </Text>
        <Text as="p" variant="bodyLg">
          Use our template editor to build a custom bouquet product in minutes.
        </Text>
      </BlockStack>
    </Card>
  )
};

const QuickStart = (
  {
    onEditAction,
    onPublishAction,
    productId,
    isPublished,
    isEditLoading,
    isDeleteLoading,
    isPublishLoading
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
              1. Create a bouquet with the template editor
            </Text>
            <Button
              variant="primary"
              onClick={onEditAction}
              accessibilityLabel="Create or edit BYOB product"
              icon={productId ? CheckIcon : PlusIcon}
              loading={isEditLoading}
              disabled={!!(productId) || isEditLoading || isDeleteLoading}
            >
              {productId ? "Created" : "Create"}
            </Button>
          </InlineStack>
        </Card>
        <Card roundedAbove="sm">
          <Text as="p" variant="bodyLg">
            2. Edit your product below. It will be linked to the template editor until you disconnect it or delete it.
          </Text>
        </Card>
        <Card roundedAbove="sm">
          <InlineStack gap="200" align="space-between" blockAlign="center">
            <Text as="p" variant="bodyLg">
              3. Publish to Online Store.
            </Text>
            <Button
              variant="primary"
              onClick={onPublishAction}
              accessibilityLabel="Publish product"
              icon={isPublished ? CheckIcon : OutboundIcon}
              loading={isPublishLoading}
              disabled={!productId || isPublished || isDeleteLoading || isEditLoading || isPublishLoading}
            >
              {isPublished ? "Published" : "Publish"}
            </Button>
          </InlineStack>
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
          No bouquet linked to the template editor. Create a new one to manage it.
        </Text>
      </InlineStack>
      : <Button
        onClick={onPreviewAction}
        accessibilityLabel="Preview BYOB product"
        icon={ViewIcon}
        size="large"
      >Preview Linked Product</Button>
  )
}

const PublishButton = (
  {
    isPublished,
    onPublishAction,
    isDeleteLoading,
    isEditLoading,
    isPublishLoading
  }: PublishButtonProps
) => {
  return (
    <Button
      variant="primary"
      onClick={onPublishAction}
      accessibilityLabel="Publish"
      icon={OutboundIcon}
      loading={isPublishLoading}
      disabled={isPublished || isDeleteLoading || isEditLoading || isPublishLoading}
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
    isPublishLoading
  }: UnpublishButtonProps
) => {
  return (
    <Button
      variant="primary"
      onClick={onUnpublishAction}
      accessibilityLabel="Unpublish"
      icon={InboundIcon}
      loading={isPublishLoading}
      disabled={!isPublished || isDeleteLoading || isEditLoading || isPublishLoading}
    >
      Unpublish
    </Button>
  )
}

const ConfirmDeleteModal = ({ onDeleteAction, shopify, isDeleteLoading }) => {
  return (
    <Modal id="confirm-delete-modal">
      <Box padding="400">
        <Text as="p" variant="bodyLg" alignment="start">This will permanently delete your bouquet. It can't be undone.</Text>
      </Box>
      <TitleBar title="Delete Bouquet">
        <button tone="critical" variant="primary" onClick={onDeleteAction}
        loading={isDeleteLoading ? "" : undefined}>Delete</button>
        <button onClick={() => shopify.modal.hide('confirm-delete-modal')}> Cancel</button>
      </TitleBar>
    </Modal>
  )
}
const LifeCycle = (
  {
    productId,
    isPublished,
    isDeleteLoading,
    isEditLoading,
    isPublishLoading,
    onPublishAction,
    onUnpublishAction,
    onDeleteAction
  }: LifeCycleProps) => {
  const shopify = useAppBridge();

  return (

    <InlineGrid gap="200" >
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
                  isPublishLoading={isPublishLoading}
                />
                <UnpublishButton
                  isPublished={isPublished}
                  onUnpublishAction={onUnpublishAction}
                  isDeleteLoading={isDeleteLoading}
                  isEditLoading={isEditLoading}
                  isPublishLoading={isPublishLoading}
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
              When published, your custom bouquet is offered in your online store.
            </Text>

          </BlockStack>
        </Card>

        <ConfirmDeleteModal onDeleteAction={onDeleteAction} shopify={shopify} isDeleteLoading={isDeleteLoading} />

        <ManageContainer
          header="Delete Bouquet"
          body="Permanently delete bouquet."
          action={

            <Button
              variant="primary"
              tone="critical"
              onClick={() => shopify.modal.show('confirm-delete-modal')}
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

const ConfirmDisconnectModal = ({ onDisconnectAction, shopify, isDisconnectLoading }) => {
  return (
    <Modal id="confirm-disconnect-modal">
      <Box padding="400">
        <Text as="p" variant="bodyLg" alignment="start">If you disconnect your custom bouquet from Foxtail template editor, it can't be undone.
          Your bouquet product will still exist, but it will not be linked to the app.
          <br/>
          <br/>
          For your convenience, the Shopify product editor will open in a new window if you disconnect.
          </Text>
      </Box>
      <TitleBar title="Disconnect Bouquet from template editor">
        <button variant="primary" tone="critical" onClick={onDisconnectAction}
          loading={isDisconnectLoading ? "" : undefined}
        >Disconnect</button>
        <button onClick={() => shopify.modal.hide('confirm-disconnect-modal')}>Cancel</button>
      </TitleBar>
    </Modal>
  )
}

const Edit = (
  {
    onEditAction,
    onDisconnectAction,
    productId,
    isEditLoading,
    isDeleteLoading,
    isDisconnectLoading
  }: EditProps) => {
  const shopify = useAppBridge();
  return (

    <InlineGrid gap="400" >
      <Divider />

      <Text as="h2" variant="headingMd">
        Edit product
      </Text>
      <ConfirmDisconnectModal onDisconnectAction={onDisconnectAction} shopify={shopify} isDisconnectLoading={isDisconnectLoading} />

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
              onClick={() => shopify.modal.show('confirm-disconnect-modal')}
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
    onDisconnectAction,
    productId,
    isPublished,
    isEditLoading,
    isDeleteLoading,
    isPublishLoading,
    isDisconnectLoading,
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

        {productId && <Edit onEditAction={onEditAction} onDisconnectAction={onDisconnectAction}
          productId={productId} isEditLoading={isEditLoading} isDeleteLoading={isDeleteLoading}
          isDisconnectLoading={isDisconnectLoading} />}

        {productId && <LifeCycle productId={productId} isPublished={isPublished} isEditLoading={isEditLoading} isDeleteLoading={isDeleteLoading}
          isPublishLoading={isPublishLoading} onDeleteAction={onDeleteAction} onPublishAction={onPublishAction} onUnpublishAction={onUnpublishAction} />}

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
        At Foxtail, we think it should be easy to order custom products. We're building online tools to
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
      <Text as="h2" variant="headingLg">
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
              onClick={() => window.open("https://foxtailcreates.com/faq.html")?.focus()}
              accessibilityLabel="FAQ"
              icon={QuestionCircleIcon}
            >
              Go to FAQ
            </Button>
          }
        />
        <SupportContainer
          header="Help Center"
          body="Find a solution to your problem via our tutorials and guides."
          action={
            <Button
              onClick={() => window.open("https://foxtailcreates.com/blog.html")?.focus()}
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
  const deleteFetcher = useFetcher();
  const publishFetcher = useFetcher();
  const disconnectFetcher = useFetcher();

  const appSettings: AppSettings = useLoaderData<typeof loader>();
  const nav = useNavigation();
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  const isEditing =
    nav.state === "loading" && nav.location.pathname === SETTINGS_PATH;

  const isDeleting = deleteFetcher.state !== "idle";
  const isPublishing = publishFetcher.state !== "idle";
  const isDisconnecting = disconnectFetcher.state !== "idle";

  const onEdit = () => {
    navigate(SETTINGS_PATH);
  };

  const onDelete = () => {
    deleteFetcher.submit({ action: "delete", productId: appSettings.productId, shopMetafieldId: appSettings.shopMetafieldId, shopId: appSettings.shopId }, { method: "post" })
  };

  const onPublish = () => {
    publishFetcher.submit({
      action: "publish",
      productId: appSettings.productId,
      shopMetafieldId: appSettings.shopMetafieldId,
      status: appSettings.status,
      publishedAt: appSettings.publishedAt,
      shopId: appSettings.shopId
    }, { method: "post" })
  };

  const onUnpublish = () => {
    publishFetcher.submit({ action: "unpublish", productId: appSettings.productId, shopMetafieldId: appSettings.shopMetafieldId, shopId: appSettings.shopId }, { method: "post" })
  };

  const onDisconnect = () => {
    const productNumber = appSettings.productId?.substring(appSettings.productId?.lastIndexOf('/') + 1);
    disconnectFetcher.submit({ action: "disconnect", productId: appSettings.productId, shopMetafieldId: appSettings.shopMetafieldId, metafieldId: appSettings.productMetafieldId, shopId: appSettings.shopId }, { method: "post" })
    shopify.modal.hide('confirm-disconnect-modal');
    window.open(`shopify://admin/products/${productNumber}`, '_blank')?.focus();
  };
  const showBanner = !isBannerDismissed && appSettings.onlineStorePreviewUrl && nav.state === "idle";

  return (
    <>
      {isEditing && <SettingsFormSkeleton />}
      {!isEditing &&
        (
          <>
            <div
              className="square-color2"
              style={{ backgroundColor: "#145A4F", paddingTop: "1rem", paddingBottom: "1.6rem", justifyContent: "center", display: "flex" }}
            >
              <img src={header_png} alt="Foxtail Custom Bouquet Template" /> 
            </div> 
            <Page>
              <Layout>
                <Layout.Section>
                  {showBanner && (
                    <SuccessBanner setIsDismissed={setIsBannerDismissed} previewLink={appSettings.onlineStorePreviewUrl!} />
                  )}
                </Layout.Section>
                <Layout.Section>
                  <InlineGrid gap="300" columns={['oneThird', 'twoThirds']}>
                    <Welcome />
                    <QuickStart
                      onEditAction={onEdit}
                      onPublishAction={onPublish}
                      productId={appSettings.productId}
                      isPublished={!!appSettings.publishedAt}
                      isEditLoading={isEditing}
                      isDeleteLoading={isDeleting}
                      isPublishLoading={isPublishing}
                    />
                  </InlineGrid>
                </Layout.Section>
                <Layout.Section>
                  <ManageProduct
                    onPreviewAction={() => window.open(appSettings.onlineStorePreviewUrl!)?.focus()}
                    onEditAction={onEdit}
                    onDeleteAction={onDelete}
                    onPublishAction={onPublish}
                    onUnpublishAction={onUnpublish}
                    onDisconnectAction={onDisconnect}
                    productId={appSettings.productId}
                    isPublished={!!appSettings.publishedAt}
                    isEditLoading={isEditing}
                    isDeleteLoading={isDeleting}
                    isPublishLoading={isPublishing}
                    isDisconnectLoading={isDisconnecting}
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
