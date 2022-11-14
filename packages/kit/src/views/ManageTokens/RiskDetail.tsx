import React, { FC, useCallback, useMemo } from 'react';

import { RouteProp, useRoute } from '@react-navigation/native';
import { useIntl } from 'react-intl';

import {
  Center,
  Divider,
  GroupingList,
  HStack,
  Icon,
  Image,
  List,
  Modal,
  Spinner,
  Typography,
  VStack,
} from '@onekeyhq/components';
import { LocaleIds } from '@onekeyhq/components/src/locale';
import { GoPlusTokenSecurity } from '@onekeyhq/engine/src/types/goplus';
import goPlus from '@onekeyhq/kit/assets/goPlus.png';
import NoRisks from '@onekeyhq/kit/assets/NoRisks.png';

import { useTokenSecurityInfo } from './hooks';
import { ManageTokenRoutes, ManageTokenRoutesParams } from './types';

type NavigationProps = RouteProp<
  ManageTokenRoutesParams,
  ManageTokenRoutes.TokenRiskDetail
>;

type LocaleType = LocaleIds | [LocaleIds, any];

// @ts-ignore
const localeMaps: Record<
  keyof GoPlusTokenSecurity,
  {
    safe?: [LocaleType, LocaleType];
    warn?: [LocaleType, LocaleType];
    danger?: [LocaleType, LocaleType];
  }
> = {
  'trust_list': {
    safe: ['form__trusted_token', 'form__trusted_token_desc'],
  },
  'is_open_source': {
    safe: ['form__source_code_verified', 'form__source_code_verified_desc'],
    danger: [
      'form__source_code_not_verified',
      'form__source_code_not_verified_desc',
    ],
  },
  'is_proxy': {
    safe: ['form__no_proxy', 'form__no_proxy_desc'],
    danger: ['form__proxy_contract_found', 'form__proxy_contract_found_desc'],
  },
  'can_take_back_ownership': {
    safe: [
      'form__ownership_cannot_be_taken_back',
      'form__ownership_cannot_be_taken_back_desc',
    ],
    danger: [
      'form__ownership_can_be_taken_back',
      'form__ownership_can_be_taken_back_desc',
    ],
  },
  'owner_change_balance': {
    safe: [
      'form__owner_cant_change_balance',
      'form__owner_cant_change_balance_desc',
    ],
    danger: [
      'form__owner_can_change_balance',
      'form__owner_can_change_balance_desc',
    ],
  },
  'hidden_owner': {
    safe: ['form__no_hidden_owner', 'form__no_hidden_owner_desc'],
    danger: ['form__hidden_owner', 'form__hidden_owner_desc'],
  },
  'external_call': {
    safe: ['form__can_not_self_destruct', 'form__can_not_self_destruct_desc'],
    danger: ['form__can_self_destruct', 'form__can_self_destruct_desc'],
  },
  'selfdestruct': {
    safe: [
      'form__no_external_call_risk_found',
      'form__no_external_call_risk_found_desc',
    ],
    danger: ['form__external_call_risk', 'form__external_call_risk_desc'],
  },
  'is_honeypot': {
    safe: [
      'form__not_appear_to_be_a_honeypot',
      'form__not_appear_to_be_a_honeypot_desc',
    ],
    danger: ['form__honeypot', 'form__honeypot_desc'],
  },
  'transfer_pausable': {
    safe: [
      'form__no_codes_found_to_suspend_trading',
      'form__no_codes_found_to_suspend_trading_desc',
    ],
    danger: ['form__pausable_transfer', 'form__pausable_transfer_desc'],
  },
  'cannot_sell_all': {
    safe: [
      'form__can_sell_all_of_the_token',
      'form__can_sell_all_of_the_token_desc',
    ],
    danger: ['form__can_not_sell_all', 'form__can_not_sell_all_desc'],
  },
  'cannot_buy': {
    safe: ['form__can_be_bought', 'form__can_be_bought_desc'],
    danger: ['form__can_not_be_bought', 'form__can_not_be_bought_desc'],
  },
  'trading_cooldown': {
    safe: [
      'form__no_trading_cooldown_function',
      'form__no_trading_cooldown_function_desc',
    ],
    danger: [
      'form__trading_with_cooldown_time',
      'form__trading_with_cooldown_time_desc',
    ],
  },
  'is_anti_whale': {
    safe: ['form__no_anti_whale', 'form__no_anti_whale_desc'],
    danger: ['form__anti_whale', 'form__anti_whale_desc'],
  },
  'slippage_modifiable': {
    safe: [
      'form__tax_can_not_be_modified',
      'form__tax_can_not_be_modified_desc',
    ],
    danger: ['form__modifiable_tax', 'form__modifiable_tax_desc'],
  },
  'is_blacklisted': {
    safe: ['form__no_blacklist', 'form__no_blacklist_desc'],
    danger: ['form__blacklist_included', 'form__blacklist_included_desc'],
  },
  'is_whitelisted': {
    safe: ['form__no_whitelist', 'form__no_whitelist_desc'],
    danger: ['form__whitelist_included', 'form__whitelist_included_desc'],
  },
  'personal_slippage_modifiable': {
    safe: [
      'form__no_tax_changes_found_for_personal_addresses',
      'form__no_tax_changes_found_for_personal_addresses_desc',
    ],
    danger: [
      'form__assinged_address_slippage_is_modifiable',
      'form__assinged_address_slippage_is_modifiable_desc',
    ],
  },
  'is_true_token': {
    danger: ['form__airdrop_scam', 'form__airdrop_scam_desc'],
  },
  'is_airdrop_scam': {
    danger: ['form__airdrop_scam', 'form__airdrop_scam_desc'],
  },
  'buy_tax': {
    danger: [
      'form__too_much_buy_tax',
      ['form__too_much_buy_tax_desc', { 0: '50%' }],
    ],
    warn: ['form__high_buy_tax', ['form__high_buy_tax_desc', { 0: '10%' }]],
  },
  'sell_tax': {
    danger: [
      'form__too_much_sell_tax',
      ['form__too_much_sell_tax_desc', { 0: '50%' }],
    ],
    warn: ['form__high_sell_tax', ['form__high_sell_tax_desc', { 0: '10%' }]],
  },
  'is_mintable': {
    warn: [
      'form__token_can_be_issued_additionall',
      'form__token_can_be_issued_additionall_desc',
    ],
    safe: ['form__no_additional_issuance', 'form__no_additional_issuance_desc'],
  },
} as const;

const RiskDetail: FC = () => {
  const intl = useIntl();
  const route = useRoute<NavigationProps>();
  const {
    token: { networkId, address },
  } = route.params;
  const { loading, data } = useTokenSecurityInfo(networkId, address);

  const { safe, danger, hasSecurity, warn } = data;

  const header = useMemo(() => {
    if (hasSecurity) {
      return (
        <Center mt="6" mb="8">
          <Icon name="ShieldExclamationSolid" color="icon-critical" size={44} />
          <Typography.DisplayLarge mt="2">
            {intl.formatMessage({ id: 'title__risky_token' })}
          </Typography.DisplayLarge>
        </Center>
      );
    }

    return (
      <Center mt="6" mb="8">
        <Image size="56px" source={NoRisks} mb="2" />
        <Typography.DisplayLarge mb="2">
          {intl.formatMessage({ id: 'form__no_risks' })}
        </Typography.DisplayLarge>
        <Typography.Body1>
          {intl.formatMessage(
            { id: 'form__no_risks_desc' },
            { 0: safe?.length ?? 0 },
          )}
        </Typography.Body1>
      </Center>
    );
  }, [hasSecurity, intl, safe]);

  const footer = useMemo(
    () => (
      <HStack
        h="8"
        pt="4"
        mb="3"
        alignItems="flex-end"
        justifyContent="center"
        mx="4"
      >
        <Typography.Body2 color="text-subdued">Powered By</Typography.Body2>
        <Image size="20px" source={goPlus} ml="2" mr="1" />
        <Typography.Body2>Go Plus</Typography.Body2>
      </HStack>
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: keyof GoPlusTokenSecurity }) => {
      const isWarnItem = warn.includes(item);
      let locale = localeMaps[item]?.[hasSecurity ? 'danger' : 'safe'];
      const warnLocale = localeMaps[item]?.warn;
      if (isWarnItem && warnLocale) {
        locale = warnLocale;
      }
      if (!locale) {
        return null;
      }
      let icon = <Icon size={20} name="BadgeCheckSolid" color="icon-success" />;
      if (hasSecurity) {
        if (isWarnItem) {
          icon = (
            <Icon size={20} name="ExclamationSolid" color="icon-warning" />
          );
        } else {
          icon = (
            <Icon
              size={20}
              name="ShieldExclamationSolid"
              color="icon-critical"
            />
          );
        }
      }
      return (
        <HStack
          mt={hasSecurity ? 4 : 0}
          mb={hasSecurity ? 0 : 4}
          alignItems="flex-start"
          w="full"
        >
          {icon}
          <VStack ml="3" flex="1">
            <Typography.Body1Strong>
              {intl.formatMessage(
                {
                  id:
                    typeof locale?.[0] === 'string'
                      ? locale?.[0]
                      : locale?.[0]?.[0],
                },
                locale?.[0]?.[1] ?? {},
              )}
            </Typography.Body1Strong>
            <Typography.Body2>
              {intl.formatMessage(
                {
                  id:
                    typeof locale?.[1] === 'string'
                      ? locale?.[1]
                      : locale?.[1][0],
                },
                locale?.[1]?.[1] ?? {},
              )}
            </Typography.Body2>
          </VStack>
        </HStack>
      );
    },
    [intl, hasSecurity, warn],
  );
  const GroupingListData = useMemo(
    () => [
      {
        headerProps: {
          title: intl.formatMessage(
            { id: 'form__str_risky_item_uppercase' },
            { 0: danger?.length ?? 0 },
          ),
        },
        data: danger,
      },
      {
        headerProps: {
          title: intl.formatMessage(
            { id: 'form__str_attention_item_uppercase' },
            { 0: warn?.length ?? 0 },
          ),
        },
        data: warn,
      },
    ],
    [danger, intl, warn],
  );

  if (loading) {
    return (
      <Modal height="560px" hidePrimaryAction hideSecondaryAction footer={null}>
        <Center flex={1}>
          <Spinner size="lg" />
        </Center>
      </Modal>
    );
  }

  return (
    <Modal height="560px" hidePrimaryAction hideSecondaryAction footer={footer}>
      {hasSecurity ? (
        <GroupingList
          ListHeaderComponent={() => header}
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={Divider}
          sections={GroupingListData}
          // @ts-ignore
          renderItem={renderItem}
          keyExtractor={(item: string, index) => `${item}_${index}`}
        />
      ) : (
        <List
          ListHeaderComponent={() => header}
          ItemSeparatorComponent={Divider}
          data={safe}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item as string}_${index}`}
        />
      )}
    </Modal>
  );
};

export default RiskDetail;