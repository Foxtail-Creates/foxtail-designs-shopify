import {
    SkeletonPage,
    Layout,
    BlockStack,
    Card,
    SkeletonBodyText,
    SkeletonDisplayText,
    Divider,
    Text,
    SkeletonTabs
} from "@shopify/polaris";

export const CustomizationsFormSkeleton = () => {
    return (
        <SkeletonPage title="Customize" primaryAction backAction>
            <Layout>
                <Layout.Section>
                    <BlockStack gap="500">
                        <Card>
                            <BlockStack gap="500">
                                <Text as={"h2"} variant="headingLg">
                                    Edit Bouquet Option Names and Prices
                                </Text>
                                <SkeletonDisplayText size="small" />
                                <SkeletonBodyText lines={2} />
                                <SkeletonTabs count={2} fitted />
                                <SkeletonTabs count={2} fitted />
                                <Divider />
                                <SkeletonDisplayText size="small" />
                                <SkeletonBodyText lines={2} />
                                <SkeletonTabs count={2} fitted />
                                <Divider />
                                <SkeletonDisplayText size="small" />
                                <SkeletonBodyText lines={2} />
                                <SkeletonTabs count={2} fitted />
                            </BlockStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </SkeletonPage>
    );
}