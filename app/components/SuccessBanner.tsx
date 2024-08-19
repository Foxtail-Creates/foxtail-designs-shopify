import { Banner, Link } from "@shopify/polaris";

export type SuccessBannerProps = {
    previewLink: string;
    setIsDismissed: React.Dispatch<React.SetStateAction<boolean>>;
  }
  
  export const SuccessBanner = ({ previewLink, setIsDismissed }: SuccessBannerProps) => {
    return (
      <Banner
        onDismiss={() => { setIsDismissed(true) }}
        tone="info"
      >
        <p> Your <Link url={previewLink} target="_blank">product preview</Link> is available!</p>
      </Banner>
    );
  }