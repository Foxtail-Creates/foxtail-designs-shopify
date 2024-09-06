export const GET_SHOP_INFORMATION_QUERY = `#graphql
    query getShopInformation {
        shop {
            id
            name
            email
            url
            billingAddress {
                city
                country
                countryCodeV2
                phone
            }
        }
    }`;
