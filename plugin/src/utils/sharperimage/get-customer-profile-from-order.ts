import { Order } from '@commercetools/platform-sdk';
import { getCustomerProfileFromOrder } from '../get-customer-profile-from-order';
import { SharperImageCustomerMapper } from '../../domain/shared/mappers/sharperimage/SharperImageCustomerMapper';
import { KlaviyoEventProfile } from '../../types/klaviyo-types';

export const getCustomerProfileFromOrderSharperImage = (
    order: Order,
    customerMapper: SharperImageCustomerMapper,
    updateAdditionalProfileProperties = false,
): KlaviyoEventProfile => {
    const initialProfile: KlaviyoEventProfile = {
        type: 'profile',
        attributes: {},
    };
    const baseProfile = getCustomerProfileFromOrder(order, customerMapper, updateAdditionalProfileProperties);
    const sharperImageProfileData = customerMapper.mapCtAddressToCustomerContact(order.billingAddress);
    return {
        ...initialProfile,
        attributes: {
            ...baseProfile.attributes,
            ...sharperImageProfileData,
            phone_number: sharperImageProfileData?.phone_number ?? undefined,
        },
    };
};
