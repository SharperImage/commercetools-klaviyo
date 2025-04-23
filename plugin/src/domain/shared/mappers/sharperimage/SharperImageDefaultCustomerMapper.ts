import { Profile } from '../../../../types/klaviyo-types';
import { DefaultCustomerMapper } from '../DefaultCustomerMapper';
import { SharperImageCustomerMapper } from './SharperImageCustomerMapper';
import { Address } from '@commercetools/platform-sdk';

export class SharperImageDefaultCustomerMapper extends DefaultCustomerMapper implements SharperImageCustomerMapper {
  mapCtAddressToCustomerContact(address?: Address): Profile | null {
    if(!address){
      return null;
    }

    return {
      firstName: address.firstName,
      lastName: address.lastName,
      phoneNumber: address.phone,
    };
  }
}