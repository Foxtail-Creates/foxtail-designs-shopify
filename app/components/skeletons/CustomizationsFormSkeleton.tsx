import {
    SkeletonPage,
    Layout,
    BlockStack,
    Card,
    SkeletonBodyText,
    Divider,
    Text,
    SkeletonTabs,
    Box,
    InlineGrid,
    useBreakpoints
} from "@shopify/polaris";

export const CustomizationsFormSkeleton = () => {
    const { smUp } = useBreakpoints();
    return (
        <SkeletonPage title="Customize" primaryAction backAction>
            <Layout>
                <Layout.Section>
                    <BlockStack gap={{ xs: "800", sm: "400" }}>
                        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
                            <Box
                                as="section"
                                paddingInlineStart={{ xs: 400, sm: 0 }}
                                paddingInlineEnd={{ xs: 400, sm: 0 }}
                            >
                                <BlockStack gap="400">
                                    <Text as="h3" variant="headingMd">
                                        Size Edits
                                    </Text>
                                    <SkeletonBodyText lines={1} />
                                </BlockStack>
                            </Box>
                            <Card roundedAbove="sm">
                                <BlockStack gap="400">
                                    <SkeletonBodyText lines={1} />
                                    <SkeletonTabs count={2} fitted />
                                    <SkeletonTabs count={2} fitted />
                                </BlockStack>
                            </Card>
                        </InlineGrid>
                        {smUp ? <Divider /> : null}
                        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
                            <Box
                                as="section"
                                paddingInlineStart={{ xs: 400, sm: 0 }}
                                paddingInlineEnd={{ xs: 400, sm: 0 }}
                            >
                                <BlockStack gap="400">
                                    <Text as="h3" variant="headingMd">
                                        Palette Edits
                                    </Text>
                                    <SkeletonBodyText lines={1} />
                                </BlockStack>
                            </Box>
                            <Card roundedAbove="sm">
                                <BlockStack gap="400">
                                    <SkeletonBodyText lines={1} />
                                    <SkeletonTabs count={2} fitted />
                                    <SkeletonTabs count={2} fitted />
                                </BlockStack>
                            </Card>
                        </InlineGrid>
                        {smUp ? <Divider /> : null}
                        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
                            <Box
                                as="section"
                                paddingInlineStart={{ xs: 400, sm: 0 }}
                                paddingInlineEnd={{ xs: 400, sm: 0 }}
                            >
                                <BlockStack gap="400">
                                    <Text as="h3" variant="headingMd">
                                        Flower Edits
                                    </Text>
                                    <SkeletonBodyText lines={1} />
                                </BlockStack>
                            </Box>
                            <Card roundedAbove="sm">
                                <BlockStack gap="400">
                                    <SkeletonBodyText lines={1} />
                                    <SkeletonTabs count={2} fitted />
                                    <SkeletonTabs count={2} fitted />
                                </BlockStack>
                            </Card>
                        </InlineGrid>
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </SkeletonPage>

    );
}