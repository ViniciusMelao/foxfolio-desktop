import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import shortid from 'shortid';
import {
  addExchange,
  deleteExchange,
  updateExchangeCredentials,
  updateExchangeTrades,
} from '../../app/actions/exchanges';
import * as exchanges from '../../app/modules/exchanges';
import { Trade } from '../../app/modules/exchanges.types';
import { getExchanges } from '../../app/selectors/selectGlobalState';
import { Store } from '../../app/store/configureStore';

let store: Store;

jest.mock('shortid');
(shortid.generate as any).mockReturnValue('id');

beforeEach(() => {
  store = createStore(combineReducers(exchanges as any), applyMiddleware(thunk)) as Store;
});

test('addExchange', async () => {
  const credentials = { apiKey: 'apiKey', secret: 'secret' };

  await store.dispatch(addExchange('binance', credentials));

  expect(getExchanges(store.getState())).toMatchObject({
    id: {
      id: 'id',
      type: 'binance',
      credentials,
      balances: {},
      trades: [],
      ledger: [],
    },
  });
});

test('updateExchangeCredentials', async () => {
  await addEmptyExchange();

  const newCredentials = { apiKey: 'apiKey', secret: 'topSecret' };
  await store.dispatch(updateExchangeCredentials('id', newCredentials));

  expect(getExchanges(store.getState())).toMatchObject({
    id: {
      id: 'id',
      type: 'binance',
      credentials: newCredentials,
      balances: {},
      trades: [],
      ledger: [],
    },
  });
});

test('updateExchangeTrades', async () => {
  await addEmptyExchange();

  const trade: Trade = {
    id: 'trade 1',
    amount: 10,
    cost: 200,
    price: 20,
    datetime: new Date('2018-01-01'),
    side: 'buy',
    symbol: 'BTC',
    timestamp: 12345,
  };

  await store.dispatch(updateExchangeTrades('id', [trade]));

  expect(getExchanges(store.getState())).toMatchObject({
    id: {
      id: 'id',
      type: 'binance',
      balances: {},
      trades: [trade],
      ledger: [],
    },
  });
});

test('deleteExchange', async () => {
  await addEmptyExchange();

  await store.dispatch(deleteExchange('id'));

  expect(getExchanges(store.getState())).toEqual({});
});

async function addEmptyExchange() {
  await store.dispatch(addExchange('binance', { apiKey: 'apiKey', secret: 'secret' }));
}
