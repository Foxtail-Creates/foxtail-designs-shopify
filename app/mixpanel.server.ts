import Mixpanel from 'mixpanel';

// create an instance of the mixpanel client
export const mixpanel = Mixpanel.init(process.env.MIXPANEL_PROJECT_TOKEN || "", { geolocate: false });
