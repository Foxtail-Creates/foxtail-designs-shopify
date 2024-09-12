import {
    SkeletonPage,
    Layout,
    BlockStack,
    Card,
    SkeletonDisplayText,
    SkeletonBodyText,
    Divider,
    Text,
    SkeletonTabs,
    Box,
    InlineGrid,
    useBreakpoints
} from "@shopify/polaris";
import { SETTINGS_FLOWER_SECTION_NAME, SETTINGS_PALETTE_SECTION_NAME, SETTINGS_PRODUCT_SECTION_NAME, SETTINGS_SIZE_SECTION_NAME } from "~/constants";

export const SettingsFormSkeleton = () => {
    const { smUp } = useBreakpoints();
    return (
        <SkeletonPage title="Settings" primaryAction backAction>
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
                                        {SETTINGS_PRODUCT_SECTION_NAME}
                                    </Text>
                                </BlockStack>
                            </Box>
                            <Card roundedAbove="sm">
                                <BlockStack gap="400">
                                    <SkeletonBodyText lines={1} />
                                    <SkeletonDisplayText size="small" />
                                    <SkeletonBodyText lines={1} />
                                    <SkeletonDisplayText size="extraLarge" />

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
                                        {SETTINGS_SIZE_SECTION_NAME}
                                    </Text>
                                    <SkeletonBodyText lines={1} />
                                </BlockStack>
                            </Box>
                            <Card roundedAbove="sm">
                                <BlockStack gap="400">
                                    <SkeletonDisplayText size="small" />
                                    <SkeletonBodyText lines={2} />
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
                                        {SETTINGS_PALETTE_SECTION_NAME}
                                    </Text>
                                    <SkeletonBodyText lines={1} />
                                </BlockStack>
                            </Box>
                            <Card roundedAbove="sm">
                                <BlockStack gap="400">
                                    <SkeletonTabs count={2} fitted />
                                    <SkeletonBodyText lines={1} />
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
                                        {SETTINGS_FLOWER_SECTION_NAME}
                                    </Text>
                                    <SkeletonBodyText lines={1} />
                                </BlockStack>
                            </Box>
                            <Card roundedAbove="sm">
                                <BlockStack gap="400">
                                    <SkeletonDisplayText size="extraLarge" />
                                    <SkeletonBodyText lines={1} />
                                </BlockStack>
                            </Card>
                        </InlineGrid>
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </SkeletonPage>
    );
}