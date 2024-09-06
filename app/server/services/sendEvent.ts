import { STORE_BILLING_ADDRESS_CITY, STORE_BILLING_ADDRESS_COUNTRY, STORE_BILLING_ADDRESS_PHONE, STORE_EMAIL, STORE_ID, STORE_NAME, STORE_URL } from '~/analyticsKeys'
import { mixpanel } from '../../mixpanel.server'

export type MixpanelEventProps = {
    storeId: string,
    eventName: string,
    properties: Record<string, string>,
}

export const trackEvent = ({ storeId, eventName, properties }: MixpanelEventProps) => {
    console.info(`Tracking event=${eventName} for storeId=${storeId}`)

    mixpanel.track(eventName, {
        ...properties,
        ip: '127.0.0.1',
        [STORE_ID]: storeId,
    })
}

export type MixpanelAddressProfile = {
    city: string | undefined | null,
    country: string | undefined | null,
    phone: string | undefined | null,
}

export type MixpanelUserProfile = {
    storeId: string,
    storeName: string,
    storeUrl: string,
    email: string,
    address: MixpanelAddressProfile,
}

export const updateProfile = (properties: MixpanelUserProfile) => {
    console.info('Updating profile for storeId', properties.storeId)

    mixpanel.people.set(properties.storeId, {
        [STORE_NAME]: properties.storeName,
        [STORE_EMAIL]: properties.email,
        [STORE_URL]: properties.storeUrl,
        [STORE_BILLING_ADDRESS_PHONE]: properties.address.phone,
        [STORE_BILLING_ADDRESS_CITY]: properties.address.city,
        [STORE_BILLING_ADDRESS_COUNTRY]: properties.address.country,
    })
}