import { CollectionSlug, countOperation, createOperation, deleteByIDOperation, deleteOperation, findByIDOperation, findOperation, findVersionByIDOperation, findVersionsOperation, forgotPasswordOperation, loginOperation, PayloadRequest, refreshOperation, resetPasswordOperation, restoreVersionOperation, SanitizedCollectionConfig, TypedCollectionSelect, unlockOperation, updateByIDOperation, updateOperation } from "payload"

export type SelectFromCollectionSlug<TSlug extends CollectionSlug> = TypedCollectionSelect[TSlug]


export type OperationMap<TOperationGeneric extends CollectionSlug> = {
  count: typeof countOperation<TOperationGeneric>
  create: typeof createOperation<TOperationGeneric, SelectFromCollectionSlug<TOperationGeneric>>
  delete: typeof deleteOperation<TOperationGeneric, SelectFromCollectionSlug<TOperationGeneric>>
  deleteByID: typeof deleteByIDOperation<
    TOperationGeneric,
    SelectFromCollectionSlug<TOperationGeneric>
  >
  find: typeof findOperation<TOperationGeneric, SelectFromCollectionSlug<TOperationGeneric>>
  findByID: typeof findByIDOperation<
    TOperationGeneric,
    boolean,
    SelectFromCollectionSlug<TOperationGeneric>
  >
  findVersionByID: typeof findVersionByIDOperation
  findVersions: typeof findVersionsOperation
  forgotPassword: typeof forgotPasswordOperation
  login: typeof loginOperation<TOperationGeneric>
  refresh: typeof refreshOperation
  resetPassword: typeof resetPasswordOperation<TOperationGeneric>
  restoreVersion: typeof restoreVersionOperation
  unlock: typeof unlockOperation<TOperationGeneric>
  update: typeof updateOperation<TOperationGeneric, SelectFromCollectionSlug<TOperationGeneric>>
  updateByID: typeof updateByIDOperation<
    TOperationGeneric,
    SelectFromCollectionSlug<TOperationGeneric>
  >
}

export type AfterOperationArg<TOperationGeneric extends CollectionSlug> = {
  /** The collection which this hook is being run on */
  collection: SanitizedCollectionConfig
  /**
   * Whether access control is being overridden for this operation
   */
  overrideAccess?: boolean
  req: PayloadRequest
} & (
    | {
      args: Parameters<OperationMap<TOperationGeneric>['count']>[0]
      operation: 'count'
      result: Awaited<ReturnType<OperationMap<TOperationGeneric>['count']>>
    }
    | {
      args: Parameters<OperationMap<TOperationGeneric>['create']>[0]
      operation: 'create'
      result: Awaited<ReturnType<OperationMap<TOperationGeneric>['create']>>
    }
    | {
      args: Parameters<OperationMap<TOperationGeneric>['delete']>[0]
      operation: 'delete'
      result: Awaited<ReturnType<OperationMap<TOperationGeneric>['delete']>>
    }
    | {
      args: Parameters<OperationMap<TOperationGeneric>['deleteByID']>[0]
      operation: 'deleteByID'
      result: Awaited<ReturnType<OperationMap<TOperationGeneric>['deleteByID']>>
    }
    | {
      args: Parameters<OperationMap<TOperationGeneric>['find']>[0]
      /**
       * @deprecated Use 'find' or 'findByID' operation instead
       *
       * TODO: v4 - remove this union option
       */
      operation: 'read'
      result: Awaited<ReturnType<OperationMap<TOperationGeneric>['find']>>
    }
    | {
      args: Parameters<OperationMap<TOperationGeneric>['find']>[0]
      operation: 'find'
      result: Awaited<ReturnType<OperationMap<TOperationGeneric>['find']>>
    }
    | {
      args: Parameters<OperationMap<TOperationGeneric>['findByID']>[0]
      operation: 'findByID'
      result: Awaited<ReturnType<OperationMap<TOperationGeneric>['findByID']>>
    }
    | {
      args: Parameters<OperationMap<TOperationGeneric>['findVersionByID']>[0]
      operation: 'findVersionByID'
      result: Awaited<ReturnType<OperationMap<TOperationGeneric>['findVersionByID']>>
    }
    | {
      args: Parameters<OperationMap<TOperationGeneric>['findVersions']>[0]
      operation: 'findVersions'
      result: Awaited<ReturnType<OperationMap<TOperationGeneric>['findVersions']>>
    }
    | {
      args: Parameters<OperationMap<TOperationGeneric>['forgotPassword']>[0]
      operation: 'forgotPassword'
      result: Awaited<ReturnType<OperationMap<TOperationGeneric>['forgotPassword']>>
    }
    | {
      args: Parameters<OperationMap<TOperationGeneric>['login']>[0]
      operation: 'login'
      result: Awaited<ReturnType<OperationMap<TOperationGeneric>['login']>>
    }
    | {
      args: Parameters<OperationMap<TOperationGeneric>['refresh']>[0]
      operation: 'refresh'
      result: Awaited<ReturnType<OperationMap<TOperationGeneric>['refresh']>>
    }
    | {
      args: Parameters<OperationMap<TOperationGeneric>['resetPassword']>[0]
      operation: 'resetPassword'
      result: Awaited<ReturnType<OperationMap<TOperationGeneric>['resetPassword']>>
    }
    | {
      args: Parameters<OperationMap<TOperationGeneric>['restoreVersion']>[0]
      operation: 'restoreVersion'
      result: Awaited<ReturnType<OperationMap<TOperationGeneric>['restoreVersion']>>
    }
    | {
      args: Parameters<OperationMap<TOperationGeneric>['unlock']>[0]
      operation: 'unlock'
      result: Awaited<ReturnType<OperationMap<TOperationGeneric>['unlock']>>
    }
    | {
      args: Parameters<OperationMap<TOperationGeneric>['update']>[0]
      operation: 'update'
      result: Awaited<ReturnType<OperationMap<TOperationGeneric>['update']>>
    }
    | {
      args: Parameters<OperationMap<TOperationGeneric>['updateByID']>[0]
      operation: 'updateByID'
      result: Awaited<ReturnType<OperationMap<TOperationGeneric>['updateByID']>>
    }
  )

export type OperationResult<
  TOperationGeneric extends CollectionSlug,
  O extends keyof OperationMap<TOperationGeneric>,
> = Awaited<ReturnType<OperationMap<TOperationGeneric>[O]>>

export type OperationArgs<
  TOperationGeneric extends CollectionSlug,
  O extends keyof OperationMap<TOperationGeneric>,
> = Parameters<OperationMap<TOperationGeneric>[O]>[0]
