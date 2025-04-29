import { Profile } from '../../../../types/klaviyo-types';
import { DefaultCustomerMapper } from '../DefaultCustomerMapper';
import { SharperImageCustomerMapper } from './SharperImageCustomerMapper';
import { Address } from '@commercetools/platform-sdk';

export class SharperImageDefaultCustomerMapper extends DefaultCustomerMapper implements SharperImageCustomerMapper {
  mapCtAddressToCustomerContact(address?: Address): Profile | null {
    if(!address){
      return null;
    }

    // phone format: +12345678901
    const phone10Digit = address.phone ? address.phone.replace(/[^0-9]+/gi, '').slice(-10).padStart(10, '0') : null;

    if(phone10Digit){
      return {
        firstName: address.firstName,
        lastName: address.lastName,
        phoneNumber: `+1${phone10Digit}`,
      };
    }
    
    return {
      firstName: address.firstName,
      lastName: address.lastName,
    };
  }
}