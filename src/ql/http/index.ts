import { extend } from 'umi-request';

const request = extend({
  timeout: 6000,
});

export { request };
