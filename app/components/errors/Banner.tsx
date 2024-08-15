import { Banner, BannerHandles, List } from '@shopify/polaris';
import { FormErrors } from '~/errors';

export type BannerProps = {
  errors: FormErrors;
  banner: React.RefObject<BannerHandles>;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
}

export function errorBanner({ errors, banner, setErrors }: BannerProps) {
  return (
    <Banner
      title="Please correct the following errors:"
      onDismiss={() => { setErrors({}) }}
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