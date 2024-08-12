import { InlineError} from "@shopify/polaris";

export function inlineError(error: string | undefined, fieldId: string) {
  return (error != undefined && error != "")
  ? (<InlineError message={error} fieldID={fieldId} />)
  : null;
}