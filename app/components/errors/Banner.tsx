import {Banner, List} from '@shopify/polaris';
import FormErrors from '~/errors';

export function errorBanner(errors: FormErrors) {
  return (
    <Banner
      title=""
      action={{content: 'Fix selection'}}
      tone="critical"
    >
      <p>
        Please correct the following errors:
        <List type="bullet">
          {errors.sizes != null ? (<List.Item>Green shirt</List.Item>) : null}
          {errors.palettes != null ? (<List.Item>Green shirt</List.Item>) : null}
          {errors.flowers != null ? (<List.Item>Green shirt</List.Item>) : null}
        </List> 
      </p>
    </Banner>
  );
}