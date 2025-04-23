import { Order } from '@commercetools/platform-sdk';
import { getCustomerProfileFromOrder } from '../get-customer-profile-from-order';
import { SharperImageCustomerMapper } from '../../domain/shared/mappers/sharperimage/SharperImageCustomerMapper';
import { KlaviyoEventProfile } from '../../types/klaviyo-types';

export const getCustomerProfileFromOrderSharperImage = (
    order: Order,
    customerMapper: SharperImageCustomerMapper,
    updateAdditionalProfileProperties = false,
): KlaviyoEventProfile => {
    const baseProfile = getCustomerProfileFromOrder(order, customerMapper, updateAdditionalProfileProperties);
    const sharperImageProfileData = customerMapper.mapCtAddressToCustomerContact(order.billingAddress);
    return {
        type: 'profile',
        attributes: {
            ...baseProfile.attributes,
            ...sharperImageProfileData,
            phone_number: sharperImageProfileData?.phone_number ?? baseProfile.attributes.phone_number,
        },
    };
};
