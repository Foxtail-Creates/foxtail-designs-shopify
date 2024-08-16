import { Banner } from "@shopify/polaris";

export type SuccessBannerProps = {
    previewLink: string;
    setIsDismissed: React.Dispatch<React.SetStateAction<boolean>>;
  }
  
  export const SuccessBanner = ({ previewLink, setIsDismissed }: SuccessBannerProps) => {
    return (
      <Banner
        title="Your product preview is ready!"
        onDismiss={() => { setIsDismissed(true) }}
        tone="success"
        action={{ content: 'Preview', url: previewLink }}
      />
    );
  }