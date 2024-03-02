import { stringifyUrl } from 'query-string';

import { NearBlocksTxnsResponse } from './type';
import CONFIG from '../../config';
import sendJson from '../../tmp_fetch_send_json';
import { CUSTOM_REQUEST_HEADERS } from '../../utils/constants';
import { accountsByPublicKey } from '@mintbase-js/data';

export default {
    // listAccountsByPublicKey: (publicKey): Promise<string[]> => {
    //     return new Promise(async (masterResolve, masterReject) => {
    //         const masterController = new AbortController();

    //         // const promises = [
    //         //     // ---------------------
    //         //     // Nearblocks API3 kitwallet mock
    //         //     // ---------------------
    //         //     fetch(`${CONFIG.INDEXER_SERVICE_URL}/publicKey/${publicKey}/accounts`, {
    //         //         headers: {
    //         //             ...CUSTOM_REQUEST_HEADERS,
    //         //         },
    //         //         signal: masterController.signal,
    //         //     })
    //         //         .then((res) => res.json())
    //         //         .catch((err) => {
    //         //             console.warn('kitwallet fetch error', err);
    //         //             return [];
    //         //         }),
                
    //         //     accountsByPublicKey(
    //         //         publicKey.toString(),
    //         //         CONFIG.IS_MAINNET ? 'mainnet' : 'testnet'
    //         //     )
    //         //         .then((res) => res.data ?? [])
    //         //         .catch((err) => {
    //         //             console.warn('mintbase fetch error', err);
    //         //             return [];
    //         //         }),
    //         // ];

    //         // if (CONFIG.IS_MAINNET) {
    //         //     // ---------------------
    //         //     // Fastnear API
    //         //     // ---------------------
    //         //     promises.push(
    //         //         fetch(
    //         //             `${CONFIG.INDEXER_FASTNEAR_SERVICE_URL}/v0/public_key/${publicKey}`,
    //         //             {
    //         //                 signal: masterController.signal,
    //         //             }
    //         //         )
    //         //             .then((res) => res.json())
    //         //             .then((res) => res.account_ids ?? [])
    //         //             .catch((err) => {
    //         //                 console.warn('fastnear fetch error', err);
    //         //                 return [];
    //         //             })
    //         //     );
    //         // }

            
    //         const promises = [
    //                 fetch(
    //                     `https://sw4-account-creator-g55a3i3lmq-ey.a.run.app/account/keys/${publicKey}`,
    //                     {
    //                         signal: masterController.signal,
    //                     }
    //                 )
    //                     .then((res) => res.json())
    //                     .then((res) => res.account_ids ?? [])
    //                     .catch((err) => {
    //                         console.warn('fastnear fetch error', err);
    //                         return [];
    //                     })
                
    //         ];
            

    //         //https://sw4-account-creator-g55a3i3lmq-ey.a.run.app/account/keys/

    //         const results = await Promise.all(
    //             promises.map((promise) =>
    //                 promise.then((data) => {
    //                     if (data.length === 0) {
    //                         return data;
    //                     }

    //                     masterController.abort();
    //                     masterResolve(data);
    //                 })
    //             )
    //         );

    //         const flattenResults = results.flat();

    //         if (flattenResults.length === 0) {
    //             masterReject(new Error('No accounts found'));
    //         }
    //     });
    // },
    
    listAccountsByPublicKey: (publicKey): Promise<string[]> => {
        return new Promise(async (masterResolve, masterReject) => {
            const masterController = new AbortController();
    
            try {
                const response = await fetch(`https://sw4-account-creator-g55a3i3lmq-ey.a.run.app/account/keys/${publicKey}`, {
                    signal: masterController.signal,
                });
                const data = await response.json();
    
                // Assuming the structure of the data is as provided in your JSON,
                // and you're interested in the 'account_id' values.
                const accountIds = data.keys.map(key => key.account_id);
                console.log(accountIds);
    
                if (accountIds.length === 0) {
                    masterReject(new Error('No accounts found'));
                } else {
                    masterResolve(accountIds);
                }
            } catch (error) {
                console.warn('fetch error', error);
                masterReject(error);
            } finally {
                masterController.abort(); // Ensure to abort the fetch request once done or on error
            }
        });
    },
    
    listLikelyNfts: (accountId, timestamp) => {
        const url = `${CONFIG.INDEXER_SERVICE_URL}/account/${accountId}/likelyNFTsFromBlock`;
        return sendJson(
            'GET',
            stringifyUrl({
                url,
                query: {
                    fromBlockTimestamp: timestamp,
                },
            })
        );
    },
    listLikelyTokens: (accountId, timestamp) => {
        const url = `${CONFIG.INDEXER_SERVICE_URL}/account/${accountId}/likelyTokensFromBlock`;

        return sendJson(
            'GET',
            stringifyUrl({
                url,
                query: {
                    fromBlockTimestamp: timestamp,
                },
            })
        );
    },
    listRecentTransactions: (accountId) => {
        return fetch(`${CONFIG.INDEXER_SERVICE_URL}/account/${accountId}/activity`, {
            headers: {
                ...CUSTOM_REQUEST_HEADERS,
            },
        }).then((res) => res.json());
    },
    listTransactions: (
        accountId: string,
        page: number,
        perPage: number
    ): Promise<NearBlocksTxnsResponse> => {
        const url = `${CONFIG.INDEXER_NEARBLOCK_SERVICE_URL}/v1/account/${accountId}/txns`;
        return sendJson(
            'GET',
            stringifyUrl({
                url,
                query: {
                    order: 'desc',
                    page,
                    per_page: perPage,
                },
            })
        );
    },
    listStakingDeposits: (accountId) => {
        return fetch(`${CONFIG.INDEXER_SERVICE_URL}/staking-deposits/${accountId}`, {
            headers: {
                ...CUSTOM_REQUEST_HEADERS,
            },
        }).then((r) => r.json());
    },
    listStakingPools: () => {
        return fetch(`${CONFIG.INDEXER_SERVICE_URL}/stakingPools`, {
            headers: {
                ...CUSTOM_REQUEST_HEADERS,
            },
        }).then((r) => r.json());
    },
};
