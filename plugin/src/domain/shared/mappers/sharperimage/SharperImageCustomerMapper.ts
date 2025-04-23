import { Address } from '@commercetools/platform-sdk';
import { DefaultCustomerMapper } from '../DefaultCustomerMapper';
import { Profile } from '../../../../types/klaviyo-types';

export interface SharperImageCustomerMapper extends DefaultCustomerMapper {
    mapCtAddressToCustomerContact(address?: Address): Profile | null;
}