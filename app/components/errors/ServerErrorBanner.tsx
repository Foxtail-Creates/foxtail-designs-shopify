import { Banner, BannerHandles, List } from '@shopify/polaris';

export type ServerErrorBannerProps = {
  banner: React.RefObject<BannerHandles>;
}

export const ServerErrorBanner =({ banner }: ServerErrorBannerProps) => {
  return (
    <Banner
      title="Could not update custom product. Please take the next steps:"
      tone="critical"
      ref={banner}
    >
      <p>
        <List type="number">
          {(<List.Item>Retry the save button in a few minutes.</List.Item>)}
          {(<List.Item>Delete and create a new product.</List.Item>)}
          {(<List.Item>Contact support.</List.Item>)}
        </List>
      </p>
    </Banner>
  );
}

