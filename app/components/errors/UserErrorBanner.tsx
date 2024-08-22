import { Banner, BannerHandles, List } from '@shopify/polaris';
import { FormErrors } from '~/errors';

export type UserErrorBannerProps = {
  errors: FormErrors;
  banner: React.RefObject<BannerHandles>;
  setUserErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
}

export const UserErrorBanner =({ errors, banner, setUserErrors }: UserErrorBannerProps) =>{
  return (
    <Banner
      title="Please correct the following errors:"
      onDismiss={() => { setUserErrors({}) }}
      tone="warning"
      ref={banner}
    >
      <p>
        <List type="bullet">
          {errors.sizes && (<List.Item>{errors.sizes}</List.Item>)}
          {errors.palettes && (<List.Item>{errors.palettes}</List.Item>)}
          {errors.flowers && (<List.Item>{errors.flowers}</List.Item>)}
        </List>
      </p>
    </Banner>
  );
}

