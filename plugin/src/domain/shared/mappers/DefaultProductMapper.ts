import {
    Category,
    CategoryReference,
    InventoryEntry,
    Product,
    ProductVariant,
    ProductVariantAvailability,
} from '@commercetools/platform-sdk';
import { ProductMapper } from './ProductMapper';
import { CurrencyService } from '../services/CurrencyService';
import config from 'config';
import {
    getLocalizedStringAsText,
    getAdditionalLocalizedStringsAsJson,
    getPreferredCurrencyFromEnv,
    getProductPriceByPriority,
    getAdditionalPricesAsJson,
    getAdditionalCurrenciesAsJson,
} from '../../../utils/locale-currency-utils';

export class DefaultProductMapper implements ProductMapper {
    constructor(private readonly currencyService: CurrencyService) {}

    private stripNonASCII(input: string | undefined | null): string {
        // eslint-disable-next-line no-control-regex
        return input?.replace(/[^\x00-\x7F]+/g, '') ?? '';
    }

    private cleanText(text: string) {
        const cleanedText = encodeURIComponent(
            this.stripNonASCII(text)
            .replace(/\s+/g, ' ')
            .trim(),
        ).replace(/%20/g, '+');
        return cleanedText;
    }

    public mapCtProductToKlaviyoItem(product: Product, update = false): ItemRequest {
        const productName = product.masterData.current.name;
        const productDescription = product.masterData.current.description;
        const productSlug = product.masterData.current.slug;
        const defaultProductSlug = getLocalizedStringAsText(productSlug);
        const defaultProductName = getLocalizedStringAsText(productName);
        const productUrl = process.env.PRODUCT_URL_TEMPLATE
            ? String(process.env.PRODUCT_URL_TEMPLATE).replace('{{productSlug}}', defaultProductSlug).replace('{{productName}}', this.cleanText(defaultProductName))
            : 'None';
        const productMasterVariantImages = product.masterData.current.masterVariant.images;
        const allProductCategories = product.masterData.current.categories.concat(
            product.masterData.current.categories.map((c) => (c.obj as Category).ancestors).flat(),
        );
        const productPrice = product.masterData.current.masterVariant.prices
            ? getProductPriceByPriority(product.masterData.current.masterVariant.prices, getPreferredCurrencyFromEnv())
            : 0;
        return {
            data: {
                type: 'catalog-item',
                id: update ? `$custom:::$default:::${defaultProductSlug}` : undefined,
                attributes: {
                    published: true,
                    integration_type: !update ? '$custom' : undefined,
                    catalog_type: !update ? '$default' : undefined,
                    external_id: !update ? defaultProductSlug : undefined,
                    title: getLocalizedStringAsText(productName),
                    description: productDescription ? getLocalizedStringAsText(productDescription) : '',
                    url: productUrl,
                    image_full_url: productMasterVariantImages ? productMasterVariantImages[0]?.url : undefined,
                    price: productPrice ? this.currencyService.convert(productPrice.amount, productPrice.currency) : 0,
                    custom_metadata: {
                        title_json: JSON.stringify(
                            getAdditionalLocalizedStringsAsJson([
                                {
                                    property: 'title',
                                    data: productName,
                                },
                            ]),
                        ),
                        slug_json: JSON.stringify(
                            getAdditionalLocalizedStringsAsJson([
                                {
                                    property: 'slug',
                                    data: productSlug,
                                },
                            ]),
                        ),
                        price_json: product.masterData.current.masterVariant.prices
                            ? JSON.stringify(
                                  getAdditionalPricesAsJson([
                                      {
                                          property: 'price',
                                          data: product.masterData.current.masterVariant.prices,
                                      },
                                  ]),
                              )
                            : undefined,
                        currency_json: product.masterData.current.masterVariant.prices
                            ? JSON.stringify(
                                  getAdditionalCurrenciesAsJson([
                                      {
                                          property: 'currency',
                                          data: product.masterData.current.masterVariant.prices,
                                      },
                                  ]),
                              )
                            : undefined,
                    },
                },
                relationships: product.masterData.current.categories?.length
                    ? {
                          categories: {
                              data: this.mapCtCategoriesToKlaviyoRelationshipCategories(allProductCategories),
                          },
                      }
                    : undefined,
            },
        };
    }

    public mapCtProductVariantToKlaviyoVariant(
        product: Product,
        productVariant: ProductVariant,
        update = false,
    ): ItemVariantRequest {
        const productName = product.masterData.current.name;
        const productDescription = product.masterData.current.description;
        const productSlug = product.masterData.current.slug;
        const defaultProductSlug = getLocalizedStringAsText(productSlug);
        const defaultProductName = getLocalizedStringAsText(productName);
        const productUrl = process.env.PRODUCT_URL_TEMPLATE
            ? String(process.env.PRODUCT_URL_TEMPLATE).replace('{{productSlug}}', defaultProductSlug).replace('{{productName}}', this.cleanText(defaultProductName))
            : 'None';
        const variantImages = productVariant.images;
        const variantPrice = productVariant.prices
            ? getProductPriceByPriority(productVariant.prices, getPreferredCurrencyFromEnv())
            : 0;
        const variantInventoryQuantity = this.getProductInventoryByPriority(productVariant.availability);
        return {
            data: {
                type: 'catalog-variant',
                id: update ? `$custom:::$default:::${productVariant.sku}` : undefined,
                attributes: {
                    published: true,
                    integration_type: !update ? '$custom' : undefined,
                    catalog_type: !update ? '$default' : undefined,
                    external_id: !update ? productVariant.sku : undefined,
                    title: getLocalizedStringAsText(productName),
                    description: productDescription ? getLocalizedStringAsText(productDescription) : '',
                    sku: !update ? productVariant.sku : undefined,
                    url: productUrl,
                    image_full_url: variantImages?.[0]?.url,
                    inventory_quantity: variantInventoryQuantity ?? 0,
                    inventory_policy: 1,
                    price: variantPrice ? this.currencyService.convert(variantPrice.amount, variantPrice.currency) : 0,
                    custom_metadata: {
                        title_json: JSON.stringify(
                            getAdditionalLocalizedStringsAsJson([
                                {
                                    property: 'title',
                                    data: productName,
                                },
                            ]),
                        ),
                        slug_json: JSON.stringify(
                            getAdditionalLocalizedStringsAsJson([
                                {
                                    property: 'slug',
                                    data: productSlug,
                                },
                            ]),
                        ),
                        price_json: productVariant.prices
                            ? JSON.stringify(
                                  getAdditionalPricesAsJson([
                                      {
                                          property: 'price',
                                          data: productVariant.prices,
                                      },
                                  ]),
                              )
                            : undefined,
                        currency_json: productVariant.prices
                            ? JSON.stringify(
                                  getAdditionalCurrenciesAsJson([
                                      {
                                          property: 'currency',
                                          data: productVariant.prices,
                                      },
                                  ]),
                              )
                            : undefined,
                    },
                },
                relationships: !update
                    ? {
                          items: {
                              data: [this.mapCtProductToKlaviyoVariantItem(product)],
                          },
                      }
                    : undefined,
            },
        };
    }

    public mapCtProductsToKlaviyoItemJob(products: Product[], type: string): ItemJobRequest {
        let jobType: any;
        switch (type) {
            case 'itemCreated':
                jobType = 'catalog-item-bulk-create-job';
                break;
            case 'itemUpdated':
                jobType = 'catalog-item-bulk-update-job';
                break;
        }

        return {
            data: {
                type: jobType,
                attributes: {
                    items: products
                        .filter((p) => p.masterData.current)
                        .map((p) => this.mapCtProductToKlaviyoItem(p, type === 'itemUpdated').data),
                },
            },
        };
    }

    private static TYPE_TO_JOB_TYPE: Record<string, 'catalog-variant-bulk-create-job' | 'catalog-variant-bulk-update-job' | 'catalog-variant-bulk-delete-job'> =  {
        variantCreated: 'catalog-variant-bulk-create-job',
        variantUpdated: 'catalog-variant-bulk-update-job',
        variantDeleted: 'catalog-variant-bulk-delete-job',
    };

    public mapCtProductVariantsToKlaviyoVariantsJob(
        product: Product,
        productVariants: ProductVariant[] | string[],
        type: string,
    ): ItemVariantJobRequest {
        const jobType = DefaultProductMapper.TYPE_TO_JOB_TYPE[type];
        return {
            data: {
                type: jobType,
                attributes: {
                    variants:
                        type === 'variantDeleted'
                            ? productVariants.map(
                                  (v) =>
                                      ({
                                          type: 'catalog-variant',
                                          id: v as string,
                                      } as ItemVariantType),
                              )
                            : productVariants.map(
                                  (v) =>
                                      this.mapCtProductVariantToKlaviyoVariant(
                                          product,
                                          v as ProductVariant,
                                          type === 'variantUpdated',
                                      ).data,
                              ),
                },
            },
        };
    }

    private mapCtCategoriesToKlaviyoRelationshipCategories(categories: CategoryReference[]): KlaviyoRelationshipData[] {
        return Array.from(new Set(categories.map((category) => category.id))).map((category) => ({
            type: 'catalog-category',
            id: `$custom:::$default:::${category}`,
        }));
    }

    private mapCtProductToKlaviyoVariantItem(product: Product): KlaviyoRelationshipData {
        const productSlug = product.masterData.current.slug;
        const defaultProductSlug = getLocalizedStringAsText(productSlug);
        return {
            type: 'catalog-item',
            id: `$custom:::$default:::${defaultProductSlug}`,
        };
    }

    public getProductInventoryByPriority(availability?: ProductVariantAvailability | InventoryEntry): number | null {
        const availableQuantity = availability?.availableQuantity || 0;

        if (!availability || !config.has('product.inventory.useChannelInventory')) {
            return availableQuantity;
        }

        const productInventoryChannel = config.get('product.inventory.useChannelInventory') as string;
        const variantAvailabilityChannels = (availability as ProductVariantAvailability).channels;
        const inventoryEntryChannel = (availability as InventoryEntry).supplyChannel;

        if (!productInventoryChannel || !(variantAvailabilityChannels || inventoryEntryChannel)) {
            if (!productInventoryChannel && inventoryEntryChannel) {
                return null;
            }
            return availableQuantity;
        }

        const variantChannelAvailableQuantity = variantAvailabilityChannels
            ? variantAvailabilityChannels[productInventoryChannel]?.availableQuantity
            : undefined;
        
        if (variantChannelAvailableQuantity) {
            return variantChannelAvailableQuantity;
        }

        const inventoryChannelAvailableQuantity =
            inventoryEntryChannel?.id === productInventoryChannel ? availability.availableQuantity : undefined;

        if (inventoryChannelAvailableQuantity) {
            return inventoryChannelAvailableQuantity;
        }
        
        if (!variantAvailabilityChannels) {
            return null;
        }

        return availableQuantity;
    }

    public mapKlaviyoItemIdToDeleteItemRequest(klaviyoItemId: string): ItemDeletedRequest {
        return {
            data: {
                id: klaviyoItemId,
            },
        };
    }

    public mapCtInventoryEntryToKlaviyoVariant(
        inventory: InventoryEntry,
        klaviyoVariant: ItemVariantType,
    ): ItemVariantRequest {
        const inventoryEntryQuantity = this.getProductInventoryByPriority(inventory);
        return {
            data: {
                type: 'catalog-variant',
                id: klaviyoVariant.id,
                attributes: {
                    inventory_policy: 1,
                    inventory_quantity: inventoryEntryQuantity !== null ? inventoryEntryQuantity : undefined,
                    published: true,
                },
            },
        };
    }
}
