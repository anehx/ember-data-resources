import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import { Resource } from 'ember-resources';

import type Store from '@ember-data/store';

export type FindRecordOptions = Parameters<Store['findRecord']>[2];

const RequestFun = Symbol('__REQUEST_FUNCTION__');

export const WrappedFun = Symbol('__Wrapped_FUNCTION__');

export class Request<Args> extends Resource<Args> {
  @service declare store: Store;

  @tracked error: Error | undefined;
  @tracked isLoading = false;
  @tracked hasRan = false;

  constructor(owner: unknown, args: Args, previous?: Request<Args>) {
    super(owner, args, previous);

    this[RequestFun]();
  }

  async [WrappedFun]() {
    throw new Error('Not Implemented');
  }

  get isSuccess() {
    return !this.error;
  }

  get isError() {
    return Boolean(this.error);
  }

  get records(): unknown | undefined {
    return assert(
      `The resource for ${this.constructor.name} does not have a records property. ` +
        `You might be looking for .record instead.`
    );
  }

  get record(): unknown | undefined {
    return assert(
      `The resource for ${this.constructor.name} does not have a records property. ` +
        `You might be looking for .record instead.`
    );
  }

  @action async retry() {
    return this[RequestFun]();
  }

  @action async [RequestFun]() {
    await Promise.resolve();

    this.error = undefined;
    this.isLoading = true;

    try {
      await this.retry();
    } catch (e) {
      this.error = e;
    } finally {
      this.isLoading = false;
      this.hasRan = true;
    }
  }
}
