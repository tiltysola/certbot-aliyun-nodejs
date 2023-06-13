#!/usr/bin/env node
import 'dotenv/config';
import process from 'process';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import dayjs from 'dayjs';
import fs from 'fs';

import Alidns20150109 from '@alicloud/alidns20150109';
import OpenApi from '@alicloud/openapi-client';
import Util from '@alicloud/tea-util';

const {
  ALIYUN_ACCESSKEY_ID,
  ALIYUN_ACCESSKEY_SECRET,
  CERTBOT_DOMAIN,
  CERTBOT_VALIDATION
} = process.env;

const argv = yargs(hideBin(process.argv)).argv;

const config = new OpenApi.Config({
  accessKeyId: ALIYUN_ACCESSKEY_ID,
  accessKeySecret: ALIYUN_ACCESSKEY_SECRET,
});
config.endpoint = 'alidns.cn-beijing.aliyuncs.com';
const client = new Alidns20150109.default(config);

const logger = (...args) => {
  console.log(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}]`, ...args);
  fs.appendFileSync('./latest.log', `[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] ${args.join(' ')}\n`);
};

const addDomainRecord = (domainName, value) => {
  const addDomainRecordRequest = new Alidns20150109.AddDomainRecordRequest({
    domainName,
    RR: '_acme-challenge',
    type: 'TXT',
    value,
  });
  const runtime = new Util.RuntimeOptions({});
  return client.addDomainRecordWithOptions(addDomainRecordRequest, runtime);
};

const deleteDomainRecord = (recordId) => {
  const deleteDomainRecordRequest = new Alidns20150109.DeleteDomainRecordRequest({
    recordId,
  });
  const runtime = new Util.RuntimeOptions({});
  return client.deleteDomainRecordWithOptions(deleteDomainRecordRequest, runtime);
};

const describeDomainRecord = (domainName, value) => {
  const deleteDomainRecordRequest = new Alidns20150109.DescribeDomainRecordsRequest({
    domainName,
    RRKeyWord: '_acme-challenge',
    typeKeyWord: 'TXT',
    valueKeyWord: value,
  });
  const runtime = new Util.RuntimeOptions({});
  return client.describeDomainRecordsWithOptions(deleteDomainRecordRequest, runtime);
};

if (!argv.clean) {
  if (CERTBOT_DOMAIN && CERTBOT_VALIDATION) {
    logger('Running manual auth hook, please be patient...');
    logger('Adding record:', CERTBOT_DOMAIN, '_acme-challenge', 'TXT', CERTBOT_VALIDATION);
    await addDomainRecord(CERTBOT_DOMAIN, CERTBOT_VALIDATION);
    logger('Record Added:', CERTBOT_DOMAIN, '_acme-challenge', 'TXT', CERTBOT_VALIDATION);
    logger('Please wait for the DNS to be updated...');
    setTimeout(() => {}, 10000);
  } else {
    logger('CERTBOT_DOMAIN & CERTBOT_VALIDATION required.');
  }
} else {
  if (CERTBOT_DOMAIN && CERTBOT_VALIDATION) {
    logger('Running manual cleanup hook, please be patient...');
    logger('Looking up record:', CERTBOT_DOMAIN, '_acme-challenge', 'TXT', CERTBOT_VALIDATION);
    const res = await describeDomainRecord(CERTBOT_DOMAIN, CERTBOT_VALIDATION);
    const records = res.body.domainRecords.record;
    if (records.length > 0) {
      for (let record of records) {
        logger('Record Found:', CERTBOT_DOMAIN, '_acme-challenge', 'TXT', record.value);
        await deleteDomainRecord(record.recordId);
        logger('Record Deleted:', CERTBOT_DOMAIN, '_acme-challenge', 'TXT', record.value);
      }
    } else {
      logger('Record Not Found:', CERTBOT_DOMAIN, '_acme-challenge', 'TXT', CERTBOT_VALIDATION);
    }
  } else {
    logger('CERTBOT_DOMAIN & CERTBOT_VALIDATION required.');
  }
}
