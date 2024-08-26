import {
    SkeletonPage,
    Layout,
    BlockStack,
    Card,
    SkeletonDisplayText,
    SkeletonBodyText,
    Divider,
    Text,
    SkeletonTabs
} from "@shopify/polaris";

export const SettingsFormSkeleton = () => {
    return (
        <SkeletonPage title="Edit" primaryAction backAction>
            <Layout>
                <Layout.Section>
                    <BlockStack gap="500">
                        <Card>
                            <BlockStack gap="500">
                                <Text as={"h2"} variant="headingLg">
                                    Product Name
                                </Text>
                                <SkeletonDisplayText size="small" />
                            </BlockStack>
                        </Card>
                        <Card>
                            <BlockStack gap="500">
                                <Text as={"h2"} variant="headingLg">
                                    Customizations
                                </Text>
                                <SkeletonBodyText lines={1} />
                                <Divider />
                                <SkeletonDisplayText size="small" />
                                <SkeletonBodyText lines={4} />
                                <Divider />
                                <SkeletonDisplayText size="small" />
                                <SkeletonTabs count={2} fitted />
                                <SkeletonDisplayText size="small" />
                                <Divider />
                                <SkeletonDisplayText size="small" />
                                <SkeletonBodyText lines={2} />
                                <SkeletonDisplayText size="extraLarge" />
                            </BlockStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </SkeletonPage>
    );
}