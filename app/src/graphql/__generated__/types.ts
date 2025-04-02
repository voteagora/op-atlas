import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Oso_Bool: { input: any; output: any; }
  Oso_Date: { input: any; output: any; }
  Oso_DateTime: { input: any; output: any; }
  Oso_DateTime646: { input: any; output: any; }
  Oso_Float32: { input: any; output: any; }
  Oso_Float64: { input: any; output: any; }
  Oso_Int64: { input: any; output: any; }
};

export enum OrderBy {
  /** Sorts the data in ascending order */
  Asc = 'Asc',
  /** Sorts the data in descending order */
  Desc = 'Desc'
}

export type Oso_ArtifactsByCollectionV1 = {
  __typename?: 'Oso_ArtifactsByCollectionV1';
  artifactId: Scalars['String']['output'];
  artifactName: Scalars['String']['output'];
  artifactNamespace: Scalars['String']['output'];
  artifactSource: Scalars['String']['output'];
  artifactSourceId: Scalars['String']['output'];
  collectionId: Scalars['String']['output'];
  collectionName: Scalars['String']['output'];
  collectionNamespace: Scalars['String']['output'];
  collectionSource: Scalars['String']['output'];
};

export type Oso_ArtifactsByCollectionV1BoolExp = {
  _and?: InputMaybe<Array<Oso_ArtifactsByCollectionV1BoolExp>>;
  _not?: InputMaybe<Oso_ArtifactsByCollectionV1BoolExp>;
  _or?: InputMaybe<Array<Oso_ArtifactsByCollectionV1BoolExp>>;
  artifactId?: InputMaybe<Oso_StringBoolExp>;
  artifactName?: InputMaybe<Oso_StringBoolExp>;
  artifactNamespace?: InputMaybe<Oso_StringBoolExp>;
  artifactSource?: InputMaybe<Oso_StringBoolExp>;
  artifactSourceId?: InputMaybe<Oso_StringBoolExp>;
  collectionId?: InputMaybe<Oso_StringBoolExp>;
  collectionName?: InputMaybe<Oso_StringBoolExp>;
  collectionNamespace?: InputMaybe<Oso_StringBoolExp>;
  collectionSource?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_ArtifactsByCollectionV1OrderByExp = {
  artifactId?: InputMaybe<OrderBy>;
  artifactName?: InputMaybe<OrderBy>;
  artifactNamespace?: InputMaybe<OrderBy>;
  artifactSource?: InputMaybe<OrderBy>;
  artifactSourceId?: InputMaybe<OrderBy>;
  collectionId?: InputMaybe<OrderBy>;
  collectionName?: InputMaybe<OrderBy>;
  collectionNamespace?: InputMaybe<OrderBy>;
  collectionSource?: InputMaybe<OrderBy>;
};

export type Oso_ArtifactsByProjectV1 = {
  __typename?: 'Oso_ArtifactsByProjectV1';
  artifactId: Scalars['String']['output'];
  artifactName: Scalars['String']['output'];
  artifactNamespace: Scalars['String']['output'];
  artifactSource: Scalars['String']['output'];
  artifactSourceId: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  projectName: Scalars['String']['output'];
  projectNamespace: Scalars['String']['output'];
  projectSource: Scalars['String']['output'];
};

export type Oso_ArtifactsByProjectV1BoolExp = {
  _and?: InputMaybe<Array<Oso_ArtifactsByProjectV1BoolExp>>;
  _not?: InputMaybe<Oso_ArtifactsByProjectV1BoolExp>;
  _or?: InputMaybe<Array<Oso_ArtifactsByProjectV1BoolExp>>;
  artifactId?: InputMaybe<Oso_StringBoolExp>;
  artifactName?: InputMaybe<Oso_StringBoolExp>;
  artifactNamespace?: InputMaybe<Oso_StringBoolExp>;
  artifactSource?: InputMaybe<Oso_StringBoolExp>;
  artifactSourceId?: InputMaybe<Oso_StringBoolExp>;
  projectId?: InputMaybe<Oso_StringBoolExp>;
  projectName?: InputMaybe<Oso_StringBoolExp>;
  projectNamespace?: InputMaybe<Oso_StringBoolExp>;
  projectSource?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_ArtifactsByProjectV1OrderBy = {
  artifactId?: InputMaybe<OrderBy>;
  artifactName?: InputMaybe<OrderBy>;
  artifactNamespace?: InputMaybe<OrderBy>;
  artifactSource?: InputMaybe<OrderBy>;
  artifactSourceId?: InputMaybe<OrderBy>;
  projectId?: InputMaybe<OrderBy>;
  projectName?: InputMaybe<OrderBy>;
  projectNamespace?: InputMaybe<OrderBy>;
  projectSource?: InputMaybe<OrderBy>;
};

export type Oso_ArtifactsByUserV1 = {
  __typename?: 'Oso_ArtifactsByUserV1';
  artifactId: Scalars['String']['output'];
  artifactName: Scalars['String']['output'];
  artifactNamespace: Scalars['String']['output'];
  artifactSource: Scalars['String']['output'];
  artifactSourceId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
  userName: Scalars['String']['output'];
  userNamespace: Scalars['String']['output'];
  userSource: Scalars['String']['output'];
  userSourceId: Scalars['String']['output'];
  userType: Scalars['String']['output'];
};

export type Oso_ArtifactsByUserV1BoolExp = {
  _and?: InputMaybe<Array<Oso_ArtifactsByUserV1BoolExp>>;
  _not?: InputMaybe<Oso_ArtifactsByUserV1BoolExp>;
  _or?: InputMaybe<Array<Oso_ArtifactsByUserV1BoolExp>>;
  artifactId?: InputMaybe<Oso_StringBoolExp>;
  artifactName?: InputMaybe<Oso_StringBoolExp>;
  artifactNamespace?: InputMaybe<Oso_StringBoolExp>;
  artifactSource?: InputMaybe<Oso_StringBoolExp>;
  artifactSourceId?: InputMaybe<Oso_StringBoolExp>;
  userId?: InputMaybe<Oso_StringBoolExp>;
  userName?: InputMaybe<Oso_StringBoolExp>;
  userNamespace?: InputMaybe<Oso_StringBoolExp>;
  userSource?: InputMaybe<Oso_StringBoolExp>;
  userSourceId?: InputMaybe<Oso_StringBoolExp>;
  userType?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_ArtifactsByUserV1OrderByExp = {
  artifactId?: InputMaybe<OrderBy>;
  artifactName?: InputMaybe<OrderBy>;
  artifactNamespace?: InputMaybe<OrderBy>;
  artifactSource?: InputMaybe<OrderBy>;
  artifactSourceId?: InputMaybe<OrderBy>;
  userId?: InputMaybe<OrderBy>;
  userName?: InputMaybe<OrderBy>;
  userNamespace?: InputMaybe<OrderBy>;
  userSource?: InputMaybe<OrderBy>;
  userSourceId?: InputMaybe<OrderBy>;
  userType?: InputMaybe<OrderBy>;
};

export type Oso_ArtifactsV1 = {
  __typename?: 'Oso_ArtifactsV1';
  artifactId: Scalars['String']['output'];
  artifactName: Scalars['String']['output'];
  artifactNamespace: Scalars['String']['output'];
  artifactSource: Scalars['String']['output'];
  artifactSourceId: Scalars['String']['output'];
};

export type Oso_ArtifactsV1BoolExp = {
  _and?: InputMaybe<Array<Oso_ArtifactsV1BoolExp>>;
  _not?: InputMaybe<Oso_ArtifactsV1BoolExp>;
  _or?: InputMaybe<Array<Oso_ArtifactsV1BoolExp>>;
  artifactId?: InputMaybe<Oso_StringBoolExp>;
  artifactName?: InputMaybe<Oso_StringBoolExp>;
  artifactNamespace?: InputMaybe<Oso_StringBoolExp>;
  artifactSource?: InputMaybe<Oso_StringBoolExp>;
  artifactSourceId?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_ArtifactsV1OrderByExp = {
  artifactId?: InputMaybe<OrderBy>;
  artifactName?: InputMaybe<OrderBy>;
  artifactNamespace?: InputMaybe<OrderBy>;
  artifactSource?: InputMaybe<OrderBy>;
  artifactSourceId?: InputMaybe<OrderBy>;
};

export type Oso_BoolBoolExp = {
  _eq?: InputMaybe<Scalars['Oso_Bool']['input']>;
  _in?: InputMaybe<Array<Scalars['Oso_Bool']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['Oso_Bool']['input']>;
  _nin?: InputMaybe<Array<Scalars['Oso_Bool']['input']>>;
};

export type Oso_CodeMetricsByArtifactV0 = {
  __typename?: 'Oso_CodeMetricsByArtifactV0';
  activeDeveloperCount6Months: Scalars['Oso_Float32']['output'];
  artifactId: Scalars['String']['output'];
  artifactName: Scalars['String']['output'];
  artifactNamespace: Scalars['String']['output'];
  closedIssueCount6Months: Scalars['Oso_Float32']['output'];
  commitCount6Months: Scalars['Oso_Float32']['output'];
  contributorCount: Scalars['Oso_Float32']['output'];
  contributorCount6Months: Scalars['Oso_Float32']['output'];
  eventSource: Scalars['String']['output'];
  firstCommitDate: Scalars['Oso_DateTime']['output'];
  forkCount: Scalars['Oso_Int64']['output'];
  fulltimeDeveloperAverage6Months: Scalars['Oso_Float32']['output'];
  lastCommitDate: Scalars['Oso_DateTime']['output'];
  mergedPullRequestCount6Months: Scalars['Oso_Float32']['output'];
  newContributorCount6Months: Scalars['Oso_Float32']['output'];
  openedIssueCount6Months: Scalars['Oso_Float32']['output'];
  openedPullRequestCount6Months: Scalars['Oso_Float32']['output'];
  starCount: Scalars['Oso_Int64']['output'];
};

export type Oso_CodeMetricsByArtifactV0BoolExp = {
  _and?: InputMaybe<Array<Oso_CodeMetricsByArtifactV0BoolExp>>;
  _not?: InputMaybe<Oso_CodeMetricsByArtifactV0BoolExp>;
  _or?: InputMaybe<Array<Oso_CodeMetricsByArtifactV0BoolExp>>;
  activeDeveloperCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  artifactId?: InputMaybe<Oso_StringBoolExp>;
  artifactName?: InputMaybe<Oso_StringBoolExp>;
  artifactNamespace?: InputMaybe<Oso_StringBoolExp>;
  closedIssueCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  commitCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  contributorCount?: InputMaybe<Oso_Float32BoolExp>;
  contributorCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  eventSource?: InputMaybe<Oso_StringBoolExp>;
  firstCommitDate?: InputMaybe<Oso_DateTimeBoolExp>;
  forkCount?: InputMaybe<Oso_Int64BoolExp>;
  fulltimeDeveloperAverage6Months?: InputMaybe<Oso_Float32BoolExp>;
  lastCommitDate?: InputMaybe<Oso_DateTimeBoolExp>;
  mergedPullRequestCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  newContributorCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  openedIssueCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  openedPullRequestCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  starCount?: InputMaybe<Oso_Int64BoolExp>;
};

export type Oso_CodeMetricsByArtifactV0OrderBy = {
  activeDeveloperCount6Months?: InputMaybe<OrderBy>;
  artifactId?: InputMaybe<OrderBy>;
  artifactName?: InputMaybe<OrderBy>;
  artifactNamespace?: InputMaybe<OrderBy>;
  closedIssueCount6Months?: InputMaybe<OrderBy>;
  commitCount6Months?: InputMaybe<OrderBy>;
  contributorCount?: InputMaybe<OrderBy>;
  contributorCount6Months?: InputMaybe<OrderBy>;
  eventSource?: InputMaybe<OrderBy>;
  firstCommitDate?: InputMaybe<OrderBy>;
  forkCount?: InputMaybe<OrderBy>;
  fulltimeDeveloperAverage6Months?: InputMaybe<OrderBy>;
  lastCommitDate?: InputMaybe<OrderBy>;
  mergedPullRequestCount6Months?: InputMaybe<OrderBy>;
  newContributorCount6Months?: InputMaybe<OrderBy>;
  openedIssueCount6Months?: InputMaybe<OrderBy>;
  openedPullRequestCount6Months?: InputMaybe<OrderBy>;
  starCount?: InputMaybe<OrderBy>;
};

export type Oso_CodeMetricsByProjectV1 = {
  __typename?: 'Oso_CodeMetricsByProjectV1';
  activeDeveloperCount6Months: Scalars['Oso_Float32']['output'];
  closedIssueCount6Months: Scalars['Oso_Float32']['output'];
  commentCount6Months: Scalars['Oso_Float32']['output'];
  commitCount6Months: Scalars['Oso_Float32']['output'];
  contributorCount: Scalars['Oso_Float32']['output'];
  contributorCount6Months: Scalars['Oso_Float32']['output'];
  developerCount: Scalars['Oso_Float32']['output'];
  displayName: Scalars['String']['output'];
  eventSource: Scalars['String']['output'];
  firstCommitDate: Scalars['Oso_DateTime']['output'];
  firstCreatedAtDate: Scalars['Oso_DateTime']['output'];
  forkCount: Scalars['Oso_Int64']['output'];
  fulltimeDeveloperAverage6Months: Scalars['Oso_Float32']['output'];
  lastCommitDate: Scalars['Oso_DateTime']['output'];
  lastUpdatedAtDate: Scalars['Oso_DateTime']['output'];
  mergedPullRequestCount6Months: Scalars['Oso_Float32']['output'];
  newContributorCount6Months: Scalars['Oso_Float32']['output'];
  openedIssueCount6Months: Scalars['Oso_Float32']['output'];
  openedPullRequestCount6Months: Scalars['Oso_Float32']['output'];
  projectId: Scalars['String']['output'];
  projectName: Scalars['String']['output'];
  projectNamespace: Scalars['String']['output'];
  projectSource: Scalars['String']['output'];
  releaseCount6Months: Scalars['Oso_Float32']['output'];
  repositoryCount: Scalars['Oso_Int64']['output'];
  starCount: Scalars['Oso_Int64']['output'];
  timeToFirstResponseDaysAverage6Months: Scalars['Oso_Float32']['output'];
  timeToMergeDaysAverage6Months: Scalars['Oso_Float32']['output'];
};

export type Oso_CodeMetricsByProjectV1BoolExp = {
  _and?: InputMaybe<Array<Oso_CodeMetricsByProjectV1BoolExp>>;
  _not?: InputMaybe<Oso_CodeMetricsByProjectV1BoolExp>;
  _or?: InputMaybe<Array<Oso_CodeMetricsByProjectV1BoolExp>>;
  activeDeveloperCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  closedIssueCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  commentCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  commitCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  contributorCount?: InputMaybe<Oso_Float32BoolExp>;
  contributorCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  developerCount?: InputMaybe<Oso_Float32BoolExp>;
  displayName?: InputMaybe<Oso_StringBoolExp>;
  eventSource?: InputMaybe<Oso_StringBoolExp>;
  firstCommitDate?: InputMaybe<Oso_DateTimeBoolExp>;
  firstCreatedAtDate?: InputMaybe<Oso_DateTimeBoolExp>;
  forkCount?: InputMaybe<Oso_Int64BoolExp>;
  fulltimeDeveloperAverage6Months?: InputMaybe<Oso_Float32BoolExp>;
  lastCommitDate?: InputMaybe<Oso_DateTimeBoolExp>;
  lastUpdatedAtDate?: InputMaybe<Oso_DateTimeBoolExp>;
  mergedPullRequestCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  newContributorCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  openedIssueCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  openedPullRequestCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  projectId?: InputMaybe<Oso_StringBoolExp>;
  projectName?: InputMaybe<Oso_StringBoolExp>;
  projectNamespace?: InputMaybe<Oso_StringBoolExp>;
  projectSource?: InputMaybe<Oso_StringBoolExp>;
  releaseCount6Months?: InputMaybe<Oso_Float32BoolExp>;
  repositoryCount?: InputMaybe<Oso_Int64BoolExp>;
  starCount?: InputMaybe<Oso_Int64BoolExp>;
  timeToFirstResponseDaysAverage6Months?: InputMaybe<Oso_Float32BoolExp>;
  timeToMergeDaysAverage6Months?: InputMaybe<Oso_Float32BoolExp>;
};

export type Oso_CodeMetricsByProjectV1OrderBy = {
  activeDeveloperCount6Months?: InputMaybe<OrderBy>;
  closedIssueCount6Months?: InputMaybe<OrderBy>;
  commentCount6Months?: InputMaybe<OrderBy>;
  commitCount6Months?: InputMaybe<OrderBy>;
  contributorCount?: InputMaybe<OrderBy>;
  contributorCount6Months?: InputMaybe<OrderBy>;
  developerCount?: InputMaybe<OrderBy>;
  displayName?: InputMaybe<OrderBy>;
  eventSource?: InputMaybe<OrderBy>;
  firstCommitDate?: InputMaybe<OrderBy>;
  firstCreatedAtDate?: InputMaybe<OrderBy>;
  forkCount?: InputMaybe<OrderBy>;
  fulltimeDeveloperAverage6Months?: InputMaybe<OrderBy>;
  lastCommitDate?: InputMaybe<OrderBy>;
  lastUpdatedAtDate?: InputMaybe<OrderBy>;
  mergedPullRequestCount6Months?: InputMaybe<OrderBy>;
  newContributorCount6Months?: InputMaybe<OrderBy>;
  openedIssueCount6Months?: InputMaybe<OrderBy>;
  openedPullRequestCount6Months?: InputMaybe<OrderBy>;
  projectId?: InputMaybe<OrderBy>;
  projectName?: InputMaybe<OrderBy>;
  projectNamespace?: InputMaybe<OrderBy>;
  projectSource?: InputMaybe<OrderBy>;
  releaseCount6Months?: InputMaybe<OrderBy>;
  repositoryCount?: InputMaybe<OrderBy>;
  starCount?: InputMaybe<OrderBy>;
  timeToFirstResponseDaysAverage6Months?: InputMaybe<OrderBy>;
  timeToMergeDaysAverage6Months?: InputMaybe<OrderBy>;
};

export type Oso_CollectionsV1 = {
  __typename?: 'Oso_CollectionsV1';
  collectionId: Scalars['String']['output'];
  collectionName: Scalars['String']['output'];
  collectionNamespace: Scalars['String']['output'];
  collectionSource: Scalars['String']['output'];
  description: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
};

export type Oso_CollectionsV1BoolExp = {
  _and?: InputMaybe<Array<Oso_CollectionsV1BoolExp>>;
  _not?: InputMaybe<Oso_CollectionsV1BoolExp>;
  _or?: InputMaybe<Array<Oso_CollectionsV1BoolExp>>;
  collectionId?: InputMaybe<Oso_StringBoolExp>;
  collectionName?: InputMaybe<Oso_StringBoolExp>;
  collectionNamespace?: InputMaybe<Oso_StringBoolExp>;
  collectionSource?: InputMaybe<Oso_StringBoolExp>;
  description?: InputMaybe<Oso_StringBoolExp>;
  displayName?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_CollectionsV1OrderBy = {
  collectionId?: InputMaybe<OrderBy>;
  collectionName?: InputMaybe<OrderBy>;
  collectionNamespace?: InputMaybe<OrderBy>;
  collectionSource?: InputMaybe<OrderBy>;
  description?: InputMaybe<OrderBy>;
  displayName?: InputMaybe<OrderBy>;
};

export type Oso_ContractsV0 = {
  __typename?: 'Oso_ContractsV0';
  contractAddress: Scalars['String']['output'];
  contractNamespace: Scalars['String']['output'];
  deploymentDate: Scalars['Oso_Date']['output'];
  factoryAddress: Scalars['String']['output'];
  originatingAddress: Scalars['String']['output'];
  rootDeployerAddress: Scalars['String']['output'];
  sortWeight: Scalars['Oso_Int64']['output'];
};

export type Oso_ContractsV0BoolExp = {
  _and?: InputMaybe<Array<Oso_ContractsV0BoolExp>>;
  _not?: InputMaybe<Oso_ContractsV0BoolExp>;
  _or?: InputMaybe<Array<Oso_ContractsV0BoolExp>>;
  contractAddress?: InputMaybe<Oso_StringBoolExp>;
  contractNamespace?: InputMaybe<Oso_StringBoolExp>;
  deploymentDate?: InputMaybe<Oso_DateBoolExp>;
  factoryAddress?: InputMaybe<Oso_StringBoolExp>;
  originatingAddress?: InputMaybe<Oso_StringBoolExp>;
  rootDeployerAddress?: InputMaybe<Oso_StringBoolExp>;
  sortWeight?: InputMaybe<Oso_Int64BoolExp>;
};

export type Oso_ContractsV0OrderByExp = {
  contractAddress?: InputMaybe<OrderBy>;
  contractNamespace?: InputMaybe<OrderBy>;
  deploymentDate?: InputMaybe<OrderBy>;
  factoryAddress?: InputMaybe<OrderBy>;
  originatingAddress?: InputMaybe<OrderBy>;
  rootDeployerAddress?: InputMaybe<OrderBy>;
  sortWeight?: InputMaybe<OrderBy>;
};

export type Oso_DateBoolExp = {
  _eq?: InputMaybe<Scalars['Oso_Date']['input']>;
  _gt?: InputMaybe<Scalars['Oso_Date']['input']>;
  _gte?: InputMaybe<Scalars['Oso_Date']['input']>;
  _in?: InputMaybe<Array<Scalars['Oso_Date']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Oso_Date']['input']>;
  _lte?: InputMaybe<Scalars['Oso_Date']['input']>;
  _neq?: InputMaybe<Scalars['Oso_Date']['input']>;
  _nin?: InputMaybe<Array<Scalars['Oso_Date']['input']>>;
};

export type Oso_DateTime646BoolExp = {
  _eq?: InputMaybe<Scalars['Oso_DateTime646']['input']>;
  _gt?: InputMaybe<Scalars['Oso_DateTime646']['input']>;
  _gte?: InputMaybe<Scalars['Oso_DateTime646']['input']>;
  _in?: InputMaybe<Array<Scalars['Oso_DateTime646']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Oso_DateTime646']['input']>;
  _lte?: InputMaybe<Scalars['Oso_DateTime646']['input']>;
  _neq?: InputMaybe<Scalars['Oso_DateTime646']['input']>;
  _nin?: InputMaybe<Array<Scalars['Oso_DateTime646']['input']>>;
};

export type Oso_DateTimeBoolExp = {
  _eq?: InputMaybe<Scalars['Oso_DateTime']['input']>;
  _gt?: InputMaybe<Scalars['Oso_DateTime']['input']>;
  _gte?: InputMaybe<Scalars['Oso_DateTime']['input']>;
  _in?: InputMaybe<Array<Scalars['Oso_DateTime']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Oso_DateTime']['input']>;
  _lte?: InputMaybe<Scalars['Oso_DateTime']['input']>;
  _neq?: InputMaybe<Scalars['Oso_DateTime']['input']>;
  _nin?: InputMaybe<Array<Scalars['Oso_DateTime']['input']>>;
};

export type Oso_EventTypesV1 = {
  __typename?: 'Oso_EventTypesV1';
  eventType: Scalars['String']['output'];
};

export type Oso_EventTypesV1BoolExp = {
  _and?: InputMaybe<Array<Oso_EventTypesV1BoolExp>>;
  _not?: InputMaybe<Oso_EventTypesV1BoolExp>;
  _or?: InputMaybe<Array<Oso_EventTypesV1BoolExp>>;
  eventType?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_EventTypesV1OrderBy = {
  eventType?: InputMaybe<OrderBy>;
};

export type Oso_Float32BoolExp = {
  _eq?: InputMaybe<Scalars['Oso_Float32']['input']>;
  _gt?: InputMaybe<Scalars['Oso_Float32']['input']>;
  _gte?: InputMaybe<Scalars['Oso_Float32']['input']>;
  _in?: InputMaybe<Array<Scalars['Oso_Float32']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Oso_Float32']['input']>;
  _lte?: InputMaybe<Scalars['Oso_Float32']['input']>;
  _neq?: InputMaybe<Scalars['Oso_Float32']['input']>;
  _nin?: InputMaybe<Array<Scalars['Oso_Float32']['input']>>;
};

export type Oso_Float64BoolExp = {
  _eq?: InputMaybe<Scalars['Oso_Float64']['input']>;
  _gt?: InputMaybe<Scalars['Oso_Float64']['input']>;
  _gte?: InputMaybe<Scalars['Oso_Float64']['input']>;
  _in?: InputMaybe<Array<Scalars['Oso_Float64']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Oso_Float64']['input']>;
  _lte?: InputMaybe<Scalars['Oso_Float64']['input']>;
  _neq?: InputMaybe<Scalars['Oso_Float64']['input']>;
  _nin?: InputMaybe<Array<Scalars['Oso_Float64']['input']>>;
};

export type Oso_FundingMetricsByProjectV1 = {
  __typename?: 'Oso_FundingMetricsByProjectV1';
  displayName: Scalars['String']['output'];
  eventSource: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  projectName: Scalars['String']['output'];
  projectNamespace: Scalars['String']['output'];
  projectSource: Scalars['String']['output'];
  totalFundersCount: Scalars['Oso_Int64']['output'];
  totalFundingReceivedUsd: Scalars['Oso_Float32']['output'];
  totalFundingReceivedUsd6Months: Scalars['Oso_Float32']['output'];
};

export type Oso_FundingMetricsByProjectV1BoolExp = {
  _and?: InputMaybe<Array<Oso_FundingMetricsByProjectV1BoolExp>>;
  _not?: InputMaybe<Oso_FundingMetricsByProjectV1BoolExp>;
  _or?: InputMaybe<Array<Oso_FundingMetricsByProjectV1BoolExp>>;
  displayName?: InputMaybe<Oso_StringBoolExp>;
  eventSource?: InputMaybe<Oso_StringBoolExp>;
  projectId?: InputMaybe<Oso_StringBoolExp>;
  projectName?: InputMaybe<Oso_StringBoolExp>;
  projectNamespace?: InputMaybe<Oso_StringBoolExp>;
  projectSource?: InputMaybe<Oso_StringBoolExp>;
  totalFundersCount?: InputMaybe<Oso_Int64BoolExp>;
  totalFundingReceivedUsd?: InputMaybe<Oso_Float32BoolExp>;
  totalFundingReceivedUsd6Months?: InputMaybe<Oso_Float32BoolExp>;
};

export type Oso_FundingMetricsByProjectV1OrderBy = {
  displayName?: InputMaybe<OrderBy>;
  eventSource?: InputMaybe<OrderBy>;
  projectId?: InputMaybe<OrderBy>;
  projectName?: InputMaybe<OrderBy>;
  projectNamespace?: InputMaybe<OrderBy>;
  projectSource?: InputMaybe<OrderBy>;
  totalFundersCount?: InputMaybe<OrderBy>;
  totalFundingReceivedUsd?: InputMaybe<OrderBy>;
  totalFundingReceivedUsd6Months?: InputMaybe<OrderBy>;
};

export type Oso_Int64BoolExp = {
  _eq?: InputMaybe<Scalars['Oso_Int64']['input']>;
  _gt?: InputMaybe<Scalars['Oso_Int64']['input']>;
  _gte?: InputMaybe<Scalars['Oso_Int64']['input']>;
  _in?: InputMaybe<Array<Scalars['Oso_Int64']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Oso_Int64']['input']>;
  _lte?: InputMaybe<Scalars['Oso_Int64']['input']>;
  _neq?: InputMaybe<Scalars['Oso_Int64']['input']>;
  _nin?: InputMaybe<Array<Scalars['Oso_Int64']['input']>>;
};

export type Oso_KeyMetricsByArtifactV0 = {
  __typename?: 'Oso_KeyMetricsByArtifactV0';
  amount: Scalars['Oso_Float64']['output'];
  artifactId: Scalars['String']['output'];
  metricId: Scalars['String']['output'];
  sampleDate: Scalars['Oso_Date']['output'];
  unit: Scalars['String']['output'];
};

export type Oso_KeyMetricsByArtifactV0BoolExp = {
  _and?: InputMaybe<Array<Oso_KeyMetricsByArtifactV0BoolExp>>;
  _not?: InputMaybe<Oso_KeyMetricsByArtifactV0BoolExp>;
  _or?: InputMaybe<Array<Oso_KeyMetricsByArtifactV0BoolExp>>;
  amount?: InputMaybe<Oso_Float64BoolExp>;
  artifactId?: InputMaybe<Oso_StringBoolExp>;
  metricId?: InputMaybe<Oso_StringBoolExp>;
  sampleDate?: InputMaybe<Oso_DateBoolExp>;
  unit?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_KeyMetricsByArtifactV0OrderByExp = {
  amount?: InputMaybe<OrderBy>;
  artifactId?: InputMaybe<OrderBy>;
  metricId?: InputMaybe<OrderBy>;
  sampleDate?: InputMaybe<OrderBy>;
  unit?: InputMaybe<OrderBy>;
};

export type Oso_KeyMetricsByCollectionV0 = {
  __typename?: 'Oso_KeyMetricsByCollectionV0';
  amount: Scalars['Oso_Float64']['output'];
  collectionId: Scalars['String']['output'];
  metricId: Scalars['String']['output'];
  sampleDate: Scalars['Oso_Date']['output'];
  unit: Scalars['String']['output'];
};

export type Oso_KeyMetricsByCollectionV0BoolExp = {
  _and?: InputMaybe<Array<Oso_KeyMetricsByCollectionV0BoolExp>>;
  _not?: InputMaybe<Oso_KeyMetricsByCollectionV0BoolExp>;
  _or?: InputMaybe<Array<Oso_KeyMetricsByCollectionV0BoolExp>>;
  amount?: InputMaybe<Oso_Float64BoolExp>;
  collectionId?: InputMaybe<Oso_StringBoolExp>;
  metricId?: InputMaybe<Oso_StringBoolExp>;
  sampleDate?: InputMaybe<Oso_DateBoolExp>;
  unit?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_KeyMetricsByCollectionV0OrderByExp = {
  amount?: InputMaybe<OrderBy>;
  collectionId?: InputMaybe<OrderBy>;
  metricId?: InputMaybe<OrderBy>;
  sampleDate?: InputMaybe<OrderBy>;
  unit?: InputMaybe<OrderBy>;
};

export type Oso_KeyMetricsByProjectV0 = {
  __typename?: 'Oso_KeyMetricsByProjectV0';
  amount: Scalars['Oso_Float64']['output'];
  metricId: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  sampleDate: Scalars['Oso_Date']['output'];
  unit: Scalars['String']['output'];
};

export type Oso_KeyMetricsByProjectV0BoolExp = {
  _and?: InputMaybe<Array<Oso_KeyMetricsByProjectV0BoolExp>>;
  _not?: InputMaybe<Oso_KeyMetricsByProjectV0BoolExp>;
  _or?: InputMaybe<Array<Oso_KeyMetricsByProjectV0BoolExp>>;
  amount?: InputMaybe<Oso_Float64BoolExp>;
  metricId?: InputMaybe<Oso_StringBoolExp>;
  projectId?: InputMaybe<Oso_StringBoolExp>;
  sampleDate?: InputMaybe<Oso_DateBoolExp>;
  unit?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_KeyMetricsByProjectV0OrderByExp = {
  amount?: InputMaybe<OrderBy>;
  metricId?: InputMaybe<OrderBy>;
  projectId?: InputMaybe<OrderBy>;
  sampleDate?: InputMaybe<OrderBy>;
  unit?: InputMaybe<OrderBy>;
};

export type Oso_MetricsV0 = {
  __typename?: 'Oso_MetricsV0';
  aggregationFunction: Scalars['String']['output'];
  definitionRef: Scalars['String']['output'];
  description: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  metricId: Scalars['String']['output'];
  metricName: Scalars['String']['output'];
  metricNamespace: Scalars['String']['output'];
  metricSource: Scalars['String']['output'];
  rawDefinition: Scalars['String']['output'];
};

export type Oso_MetricsV0BoolExp = {
  _and?: InputMaybe<Array<Oso_MetricsV0BoolExp>>;
  _not?: InputMaybe<Oso_MetricsV0BoolExp>;
  _or?: InputMaybe<Array<Oso_MetricsV0BoolExp>>;
  aggregationFunction?: InputMaybe<Oso_StringBoolExp>;
  definitionRef?: InputMaybe<Oso_StringBoolExp>;
  description?: InputMaybe<Oso_StringBoolExp>;
  displayName?: InputMaybe<Oso_StringBoolExp>;
  metricId?: InputMaybe<Oso_StringBoolExp>;
  metricName?: InputMaybe<Oso_StringBoolExp>;
  metricNamespace?: InputMaybe<Oso_StringBoolExp>;
  metricSource?: InputMaybe<Oso_StringBoolExp>;
  rawDefinition?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_MetricsV0OrderBy = {
  aggregationFunction?: InputMaybe<OrderBy>;
  definitionRef?: InputMaybe<OrderBy>;
  description?: InputMaybe<OrderBy>;
  displayName?: InputMaybe<OrderBy>;
  metricId?: InputMaybe<OrderBy>;
  metricName?: InputMaybe<OrderBy>;
  metricNamespace?: InputMaybe<OrderBy>;
  metricSource?: InputMaybe<OrderBy>;
  rawDefinition?: InputMaybe<OrderBy>;
};

export type Oso_ModelsV0 = {
  __typename?: 'Oso_ModelsV0';
  modelId: Scalars['String']['output'];
  modelName: Scalars['String']['output'];
  renderedAt: Scalars['Oso_DateTime646']['output'];
  renderedSql: Scalars['String']['output'];
};

export type Oso_ModelsV0BoolExp = {
  _and?: InputMaybe<Array<Oso_ModelsV0BoolExp>>;
  _not?: InputMaybe<Oso_ModelsV0BoolExp>;
  _or?: InputMaybe<Array<Oso_ModelsV0BoolExp>>;
  modelId?: InputMaybe<Oso_StringBoolExp>;
  modelName?: InputMaybe<Oso_StringBoolExp>;
  renderedAt?: InputMaybe<Oso_DateTime646BoolExp>;
  renderedSql?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_ModelsV0OrderByExp = {
  modelId?: InputMaybe<OrderBy>;
  modelName?: InputMaybe<OrderBy>;
  renderedAt?: InputMaybe<OrderBy>;
  renderedSql?: InputMaybe<OrderBy>;
};

export type Oso_OnchainMetricsByProjectV1 = {
  __typename?: 'Oso_OnchainMetricsByProjectV1';
  activeContractCount90Days: Scalars['Oso_Float32']['output'];
  addressCount: Scalars['Oso_Float32']['output'];
  addressCount90Days: Scalars['Oso_Float32']['output'];
  daysSinceFirstTransaction: Scalars['Oso_Float32']['output'];
  displayName: Scalars['String']['output'];
  eventSource: Scalars['String']['output'];
  gasFeesSum: Scalars['Oso_Float32']['output'];
  gasFeesSum6Months: Scalars['Oso_Float32']['output'];
  highActivityAddressCount90Days: Scalars['Oso_Float32']['output'];
  lowActivityAddressCount90Days: Scalars['Oso_Float32']['output'];
  mediumActivityAddressCount90Days: Scalars['Oso_Float32']['output'];
  multiProjectAddressCount90Days: Scalars['Oso_Float32']['output'];
  newAddressCount90Days: Scalars['Oso_Float32']['output'];
  projectId: Scalars['String']['output'];
  projectName: Scalars['String']['output'];
  projectNamespace: Scalars['String']['output'];
  projectSource: Scalars['String']['output'];
  returningAddressCount90Days: Scalars['Oso_Float32']['output'];
  transactionCount: Scalars['Oso_Float32']['output'];
  transactionCount6Months: Scalars['Oso_Float32']['output'];
};

export type Oso_OnchainMetricsByProjectV1BoolExp = {
  _and?: InputMaybe<Array<Oso_OnchainMetricsByProjectV1BoolExp>>;
  _not?: InputMaybe<Oso_OnchainMetricsByProjectV1BoolExp>;
  _or?: InputMaybe<Array<Oso_OnchainMetricsByProjectV1BoolExp>>;
  activeContractCount90Days?: InputMaybe<Oso_Float32BoolExp>;
  addressCount?: InputMaybe<Oso_Float32BoolExp>;
  addressCount90Days?: InputMaybe<Oso_Float32BoolExp>;
  daysSinceFirstTransaction?: InputMaybe<Oso_Float32BoolExp>;
  displayName?: InputMaybe<Oso_StringBoolExp>;
  eventSource?: InputMaybe<Oso_StringBoolExp>;
  gasFeesSum?: InputMaybe<Oso_Float32BoolExp>;
  gasFeesSum6Months?: InputMaybe<Oso_Float32BoolExp>;
  highActivityAddressCount90Days?: InputMaybe<Oso_Float32BoolExp>;
  lowActivityAddressCount90Days?: InputMaybe<Oso_Float32BoolExp>;
  mediumActivityAddressCount90Days?: InputMaybe<Oso_Float32BoolExp>;
  multiProjectAddressCount90Days?: InputMaybe<Oso_Float32BoolExp>;
  newAddressCount90Days?: InputMaybe<Oso_Float32BoolExp>;
  projectId?: InputMaybe<Oso_StringBoolExp>;
  projectName?: InputMaybe<Oso_StringBoolExp>;
  projectNamespace?: InputMaybe<Oso_StringBoolExp>;
  projectSource?: InputMaybe<Oso_StringBoolExp>;
  returningAddressCount90Days?: InputMaybe<Oso_Float32BoolExp>;
  transactionCount?: InputMaybe<Oso_Float32BoolExp>;
  transactionCount6Months?: InputMaybe<Oso_Float32BoolExp>;
};

export type Oso_OnchainMetricsByProjectV1OrderBy = {
  activeContractCount90Days?: InputMaybe<OrderBy>;
  addressCount?: InputMaybe<OrderBy>;
  addressCount90Days?: InputMaybe<OrderBy>;
  daysSinceFirstTransaction?: InputMaybe<OrderBy>;
  displayName?: InputMaybe<OrderBy>;
  eventSource?: InputMaybe<OrderBy>;
  gasFeesSum?: InputMaybe<OrderBy>;
  gasFeesSum6Months?: InputMaybe<OrderBy>;
  highActivityAddressCount90Days?: InputMaybe<OrderBy>;
  lowActivityAddressCount90Days?: InputMaybe<OrderBy>;
  mediumActivityAddressCount90Days?: InputMaybe<OrderBy>;
  multiProjectAddressCount90Days?: InputMaybe<OrderBy>;
  newAddressCount90Days?: InputMaybe<OrderBy>;
  projectId?: InputMaybe<OrderBy>;
  projectName?: InputMaybe<OrderBy>;
  projectNamespace?: InputMaybe<OrderBy>;
  projectSource?: InputMaybe<OrderBy>;
  returningAddressCount90Days?: InputMaybe<OrderBy>;
  transactionCount?: InputMaybe<OrderBy>;
  transactionCount6Months?: InputMaybe<OrderBy>;
};

export type Oso_PackageOwnersV0 = {
  __typename?: 'Oso_PackageOwnersV0';
  packageArtifactId: Scalars['String']['output'];
  packageArtifactName: Scalars['String']['output'];
  packageArtifactNamespace: Scalars['String']['output'];
  packageArtifactSource: Scalars['String']['output'];
  packageOwnerArtifactId: Scalars['String']['output'];
  packageOwnerArtifactName: Scalars['String']['output'];
  packageOwnerArtifactNamespace: Scalars['String']['output'];
  packageOwnerProjectId: Scalars['String']['output'];
  packageOwnerSource: Scalars['String']['output'];
  packageProjectId: Scalars['String']['output'];
};

export type Oso_PackageOwnersV0BoolExp = {
  _and?: InputMaybe<Array<Oso_PackageOwnersV0BoolExp>>;
  _not?: InputMaybe<Oso_PackageOwnersV0BoolExp>;
  _or?: InputMaybe<Array<Oso_PackageOwnersV0BoolExp>>;
  packageArtifactId?: InputMaybe<Oso_StringBoolExp>;
  packageArtifactName?: InputMaybe<Oso_StringBoolExp>;
  packageArtifactNamespace?: InputMaybe<Oso_StringBoolExp>;
  packageArtifactSource?: InputMaybe<Oso_StringBoolExp>;
  packageOwnerArtifactId?: InputMaybe<Oso_StringBoolExp>;
  packageOwnerArtifactName?: InputMaybe<Oso_StringBoolExp>;
  packageOwnerArtifactNamespace?: InputMaybe<Oso_StringBoolExp>;
  packageOwnerProjectId?: InputMaybe<Oso_StringBoolExp>;
  packageOwnerSource?: InputMaybe<Oso_StringBoolExp>;
  packageProjectId?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_PackageOwnersV0OrderByExp = {
  packageArtifactId?: InputMaybe<OrderBy>;
  packageArtifactName?: InputMaybe<OrderBy>;
  packageArtifactNamespace?: InputMaybe<OrderBy>;
  packageArtifactSource?: InputMaybe<OrderBy>;
  packageOwnerArtifactId?: InputMaybe<OrderBy>;
  packageOwnerArtifactName?: InputMaybe<OrderBy>;
  packageOwnerArtifactNamespace?: InputMaybe<OrderBy>;
  packageOwnerProjectId?: InputMaybe<OrderBy>;
  packageOwnerSource?: InputMaybe<OrderBy>;
  packageProjectId?: InputMaybe<OrderBy>;
};

export type Oso_ProjectsByCollectionV1 = {
  __typename?: 'Oso_ProjectsByCollectionV1';
  collectionId: Scalars['String']['output'];
  collectionName: Scalars['String']['output'];
  collectionNamespace: Scalars['String']['output'];
  collectionSource: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  projectName: Scalars['String']['output'];
  projectNamespace: Scalars['String']['output'];
  projectSource: Scalars['String']['output'];
};

export type Oso_ProjectsByCollectionV1BoolExp = {
  _and?: InputMaybe<Array<Oso_ProjectsByCollectionV1BoolExp>>;
  _not?: InputMaybe<Oso_ProjectsByCollectionV1BoolExp>;
  _or?: InputMaybe<Array<Oso_ProjectsByCollectionV1BoolExp>>;
  collectionId?: InputMaybe<Oso_StringBoolExp>;
  collectionName?: InputMaybe<Oso_StringBoolExp>;
  collectionNamespace?: InputMaybe<Oso_StringBoolExp>;
  collectionSource?: InputMaybe<Oso_StringBoolExp>;
  projectId?: InputMaybe<Oso_StringBoolExp>;
  projectName?: InputMaybe<Oso_StringBoolExp>;
  projectNamespace?: InputMaybe<Oso_StringBoolExp>;
  projectSource?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_ProjectsByCollectionV1OrderBy = {
  collectionId?: InputMaybe<OrderBy>;
  collectionName?: InputMaybe<OrderBy>;
  collectionNamespace?: InputMaybe<OrderBy>;
  collectionSource?: InputMaybe<OrderBy>;
  projectId?: InputMaybe<OrderBy>;
  projectName?: InputMaybe<OrderBy>;
  projectNamespace?: InputMaybe<OrderBy>;
  projectSource?: InputMaybe<OrderBy>;
};

export type Oso_ProjectsV1 = {
  __typename?: 'Oso_ProjectsV1';
  description: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  projectName: Scalars['String']['output'];
  projectNamespace: Scalars['String']['output'];
  projectSource: Scalars['String']['output'];
};

export type Oso_ProjectsV1BoolExp = {
  _and?: InputMaybe<Array<Oso_ProjectsV1BoolExp>>;
  _not?: InputMaybe<Oso_ProjectsV1BoolExp>;
  _or?: InputMaybe<Array<Oso_ProjectsV1BoolExp>>;
  description?: InputMaybe<Oso_StringBoolExp>;
  displayName?: InputMaybe<Oso_StringBoolExp>;
  projectId?: InputMaybe<Oso_StringBoolExp>;
  projectName?: InputMaybe<Oso_StringBoolExp>;
  projectNamespace?: InputMaybe<Oso_StringBoolExp>;
  projectSource?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_ProjectsV1OrderBy = {
  description?: InputMaybe<OrderBy>;
  displayName?: InputMaybe<OrderBy>;
  projectId?: InputMaybe<OrderBy>;
  projectName?: InputMaybe<OrderBy>;
  projectNamespace?: InputMaybe<OrderBy>;
  projectSource?: InputMaybe<OrderBy>;
};

export type Oso_RepositoriesV0 = {
  __typename?: 'Oso_RepositoriesV0';
  artifactId: Scalars['String']['output'];
  artifactName: Scalars['String']['output'];
  artifactNamespace: Scalars['String']['output'];
  artifactSource: Scalars['String']['output'];
  artifactSourceId: Scalars['String']['output'];
  artifactUrl: Scalars['String']['output'];
  branch: Scalars['String']['output'];
  createdAt: Scalars['Oso_DateTime']['output'];
  forkCount: Scalars['Oso_Int64']['output'];
  isFork: Scalars['Oso_Bool']['output'];
  language: Scalars['String']['output'];
  licenseName: Scalars['String']['output'];
  licenseSpdxId: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  starCount: Scalars['Oso_Int64']['output'];
  updatedAt: Scalars['Oso_DateTime']['output'];
  watcherCount: Scalars['Oso_Int64']['output'];
};

export type Oso_RepositoriesV0BoolExp = {
  _and?: InputMaybe<Array<Oso_RepositoriesV0BoolExp>>;
  _not?: InputMaybe<Oso_RepositoriesV0BoolExp>;
  _or?: InputMaybe<Array<Oso_RepositoriesV0BoolExp>>;
  artifactId?: InputMaybe<Oso_StringBoolExp>;
  artifactName?: InputMaybe<Oso_StringBoolExp>;
  artifactNamespace?: InputMaybe<Oso_StringBoolExp>;
  artifactSource?: InputMaybe<Oso_StringBoolExp>;
  artifactSourceId?: InputMaybe<Oso_StringBoolExp>;
  artifactUrl?: InputMaybe<Oso_StringBoolExp>;
  branch?: InputMaybe<Oso_StringBoolExp>;
  createdAt?: InputMaybe<Oso_DateTimeBoolExp>;
  forkCount?: InputMaybe<Oso_Int64BoolExp>;
  isFork?: InputMaybe<Oso_BoolBoolExp>;
  language?: InputMaybe<Oso_StringBoolExp>;
  licenseName?: InputMaybe<Oso_StringBoolExp>;
  licenseSpdxId?: InputMaybe<Oso_StringBoolExp>;
  projectId?: InputMaybe<Oso_StringBoolExp>;
  starCount?: InputMaybe<Oso_Int64BoolExp>;
  updatedAt?: InputMaybe<Oso_DateTimeBoolExp>;
  watcherCount?: InputMaybe<Oso_Int64BoolExp>;
};

export type Oso_RepositoriesV0OrderByExp = {
  artifactId?: InputMaybe<OrderBy>;
  artifactName?: InputMaybe<OrderBy>;
  artifactNamespace?: InputMaybe<OrderBy>;
  artifactSource?: InputMaybe<OrderBy>;
  artifactSourceId?: InputMaybe<OrderBy>;
  artifactUrl?: InputMaybe<OrderBy>;
  branch?: InputMaybe<OrderBy>;
  createdAt?: InputMaybe<OrderBy>;
  forkCount?: InputMaybe<OrderBy>;
  isFork?: InputMaybe<OrderBy>;
  language?: InputMaybe<OrderBy>;
  licenseName?: InputMaybe<OrderBy>;
  licenseSpdxId?: InputMaybe<OrderBy>;
  projectId?: InputMaybe<OrderBy>;
  starCount?: InputMaybe<OrderBy>;
  updatedAt?: InputMaybe<OrderBy>;
  watcherCount?: InputMaybe<OrderBy>;
};

export type Oso_SbomsV0 = {
  __typename?: 'Oso_SbomsV0';
  fromArtifactId: Scalars['String']['output'];
  fromArtifactName: Scalars['String']['output'];
  fromArtifactNamespace: Scalars['String']['output'];
  fromArtifactSource: Scalars['String']['output'];
  fromProjectId: Scalars['String']['output'];
  toPackageArtifactId: Scalars['String']['output'];
  toPackageArtifactName: Scalars['String']['output'];
  toPackageArtifactNamespace: Scalars['String']['output'];
  toPackageArtifactSource: Scalars['String']['output'];
  toPackageProjectId: Scalars['String']['output'];
};

export type Oso_SbomsV0BoolExp = {
  _and?: InputMaybe<Array<Oso_SbomsV0BoolExp>>;
  _not?: InputMaybe<Oso_SbomsV0BoolExp>;
  _or?: InputMaybe<Array<Oso_SbomsV0BoolExp>>;
  fromArtifactId?: InputMaybe<Oso_StringBoolExp>;
  fromArtifactName?: InputMaybe<Oso_StringBoolExp>;
  fromArtifactNamespace?: InputMaybe<Oso_StringBoolExp>;
  fromArtifactSource?: InputMaybe<Oso_StringBoolExp>;
  fromProjectId?: InputMaybe<Oso_StringBoolExp>;
  toPackageArtifactId?: InputMaybe<Oso_StringBoolExp>;
  toPackageArtifactName?: InputMaybe<Oso_StringBoolExp>;
  toPackageArtifactNamespace?: InputMaybe<Oso_StringBoolExp>;
  toPackageArtifactSource?: InputMaybe<Oso_StringBoolExp>;
  toPackageProjectId?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_SbomsV0OrderByExp = {
  fromArtifactId?: InputMaybe<OrderBy>;
  fromArtifactName?: InputMaybe<OrderBy>;
  fromArtifactNamespace?: InputMaybe<OrderBy>;
  fromArtifactSource?: InputMaybe<OrderBy>;
  fromProjectId?: InputMaybe<OrderBy>;
  toPackageArtifactId?: InputMaybe<OrderBy>;
  toPackageArtifactName?: InputMaybe<OrderBy>;
  toPackageArtifactNamespace?: InputMaybe<OrderBy>;
  toPackageArtifactSource?: InputMaybe<OrderBy>;
  toPackageProjectId?: InputMaybe<OrderBy>;
};

export type Oso_StringBoolExp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<Scalars['String']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _match?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<Scalars['String']['input']>>;
  _nlike?: InputMaybe<Scalars['String']['input']>;
};

export type Oso_TimeseriesEventsByArtifactV0 = {
  __typename?: 'Oso_TimeseriesEventsByArtifactV0';
  amount: Scalars['Oso_Float32']['output'];
  eventSource: Scalars['String']['output'];
  eventSourceId: Scalars['String']['output'];
  eventType: Scalars['String']['output'];
  fromArtifactId: Scalars['String']['output'];
  time: Scalars['Oso_DateTime']['output'];
  toArtifactId: Scalars['String']['output'];
};

export type Oso_TimeseriesEventsByArtifactV0BoolExp = {
  _and?: InputMaybe<Array<Oso_TimeseriesEventsByArtifactV0BoolExp>>;
  _not?: InputMaybe<Oso_TimeseriesEventsByArtifactV0BoolExp>;
  _or?: InputMaybe<Array<Oso_TimeseriesEventsByArtifactV0BoolExp>>;
  amount?: InputMaybe<Oso_Float32BoolExp>;
  eventSource?: InputMaybe<Oso_StringBoolExp>;
  eventSourceId?: InputMaybe<Oso_StringBoolExp>;
  eventType?: InputMaybe<Oso_StringBoolExp>;
  fromArtifactId?: InputMaybe<Oso_StringBoolExp>;
  time?: InputMaybe<Oso_DateTimeBoolExp>;
  toArtifactId?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_TimeseriesEventsByArtifactV0OrderBy = {
  amount?: InputMaybe<OrderBy>;
  eventSource?: InputMaybe<OrderBy>;
  eventSourceId?: InputMaybe<OrderBy>;
  eventType?: InputMaybe<OrderBy>;
  fromArtifactId?: InputMaybe<OrderBy>;
  time?: InputMaybe<OrderBy>;
  toArtifactId?: InputMaybe<OrderBy>;
};

export type Oso_TimeseriesMetricsByArtifactV0 = {
  __typename?: 'Oso_TimeseriesMetricsByArtifactV0';
  amount: Scalars['Oso_Float64']['output'];
  artifactId: Scalars['String']['output'];
  metricId: Scalars['String']['output'];
  sampleDate: Scalars['Oso_Date']['output'];
  unit: Scalars['String']['output'];
};

export type Oso_TimeseriesMetricsByArtifactV0BoolExp = {
  _and?: InputMaybe<Array<Oso_TimeseriesMetricsByArtifactV0BoolExp>>;
  _not?: InputMaybe<Oso_TimeseriesMetricsByArtifactV0BoolExp>;
  _or?: InputMaybe<Array<Oso_TimeseriesMetricsByArtifactV0BoolExp>>;
  amount?: InputMaybe<Oso_Float64BoolExp>;
  artifactId?: InputMaybe<Oso_StringBoolExp>;
  metricId?: InputMaybe<Oso_StringBoolExp>;
  sampleDate?: InputMaybe<Oso_DateBoolExp>;
  unit?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_TimeseriesMetricsByArtifactV0OrderBy = {
  amount?: InputMaybe<OrderBy>;
  artifactId?: InputMaybe<OrderBy>;
  metricId?: InputMaybe<OrderBy>;
  sampleDate?: InputMaybe<OrderBy>;
  unit?: InputMaybe<OrderBy>;
};

export type Oso_TimeseriesMetricsByCollectionV0 = {
  __typename?: 'Oso_TimeseriesMetricsByCollectionV0';
  amount: Scalars['Oso_Float64']['output'];
  collectionId: Scalars['String']['output'];
  metricId: Scalars['String']['output'];
  sampleDate: Scalars['Oso_Date']['output'];
  unit: Scalars['String']['output'];
};

export type Oso_TimeseriesMetricsByCollectionV0BoolExp = {
  _and?: InputMaybe<Array<Oso_TimeseriesMetricsByCollectionV0BoolExp>>;
  _not?: InputMaybe<Oso_TimeseriesMetricsByCollectionV0BoolExp>;
  _or?: InputMaybe<Array<Oso_TimeseriesMetricsByCollectionV0BoolExp>>;
  amount?: InputMaybe<Oso_Float64BoolExp>;
  collectionId?: InputMaybe<Oso_StringBoolExp>;
  metricId?: InputMaybe<Oso_StringBoolExp>;
  sampleDate?: InputMaybe<Oso_DateBoolExp>;
  unit?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_TimeseriesMetricsByCollectionV0OrderBy = {
  amount?: InputMaybe<OrderBy>;
  collectionId?: InputMaybe<OrderBy>;
  metricId?: InputMaybe<OrderBy>;
  sampleDate?: InputMaybe<OrderBy>;
  unit?: InputMaybe<OrderBy>;
};

export type Oso_TimeseriesMetricsByProjectV0 = {
  __typename?: 'Oso_TimeseriesMetricsByProjectV0';
  amount: Scalars['Oso_Float64']['output'];
  metricId: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  sampleDate: Scalars['Oso_Date']['output'];
  unit: Scalars['String']['output'];
};

export type Oso_TimeseriesMetricsByProjectV0BoolExp = {
  _and?: InputMaybe<Array<Oso_TimeseriesMetricsByProjectV0BoolExp>>;
  _not?: InputMaybe<Oso_TimeseriesMetricsByProjectV0BoolExp>;
  _or?: InputMaybe<Array<Oso_TimeseriesMetricsByProjectV0BoolExp>>;
  amount?: InputMaybe<Oso_Float64BoolExp>;
  metricId?: InputMaybe<Oso_StringBoolExp>;
  projectId?: InputMaybe<Oso_StringBoolExp>;
  sampleDate?: InputMaybe<Oso_DateBoolExp>;
  unit?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_TimeseriesMetricsByProjectV0OrderBy = {
  amount?: InputMaybe<OrderBy>;
  metricId?: InputMaybe<OrderBy>;
  projectId?: InputMaybe<OrderBy>;
  sampleDate?: InputMaybe<OrderBy>;
  unit?: InputMaybe<OrderBy>;
};

export type Oso_UsersV1 = {
  __typename?: 'Oso_UsersV1';
  bio: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  profilePictureUrl: Scalars['String']['output'];
  url: Scalars['String']['output'];
  userId: Scalars['String']['output'];
  userSource: Scalars['String']['output'];
  userSourceId: Scalars['String']['output'];
};

export type Oso_UsersV1BoolExp = {
  _and?: InputMaybe<Array<Oso_UsersV1BoolExp>>;
  _not?: InputMaybe<Oso_UsersV1BoolExp>;
  _or?: InputMaybe<Array<Oso_UsersV1BoolExp>>;
  bio?: InputMaybe<Oso_StringBoolExp>;
  displayName?: InputMaybe<Oso_StringBoolExp>;
  profilePictureUrl?: InputMaybe<Oso_StringBoolExp>;
  url?: InputMaybe<Oso_StringBoolExp>;
  userId?: InputMaybe<Oso_StringBoolExp>;
  userSource?: InputMaybe<Oso_StringBoolExp>;
  userSourceId?: InputMaybe<Oso_StringBoolExp>;
};

export type Oso_UsersV1OrderBy = {
  bio?: InputMaybe<OrderBy>;
  displayName?: InputMaybe<OrderBy>;
  profilePictureUrl?: InputMaybe<OrderBy>;
  url?: InputMaybe<OrderBy>;
  userId?: InputMaybe<OrderBy>;
  userSource?: InputMaybe<OrderBy>;
  userSourceId?: InputMaybe<OrderBy>;
};

export type Query = {
  __typename?: 'Query';
  oso_artifactsByCollectionV1?: Maybe<Array<Oso_ArtifactsByCollectionV1>>;
  oso_artifactsByProjectV1?: Maybe<Array<Oso_ArtifactsByProjectV1>>;
  oso_artifactsByUserV1?: Maybe<Array<Oso_ArtifactsByUserV1>>;
  oso_artifactsV1?: Maybe<Array<Oso_ArtifactsV1>>;
  oso_codeMetricsByArtifactV0?: Maybe<Array<Oso_CodeMetricsByArtifactV0>>;
  oso_codeMetricsByProjectV1?: Maybe<Array<Oso_CodeMetricsByProjectV1>>;
  oso_collectionsV1?: Maybe<Array<Oso_CollectionsV1>>;
  oso_contractsV0?: Maybe<Array<Oso_ContractsV0>>;
  oso_contractsV0ByDeploymentDate?: Maybe<Oso_ContractsV0>;
  oso_eventTypesV1?: Maybe<Array<Oso_EventTypesV1>>;
  oso_fundingMetricsByProjectV1?: Maybe<Array<Oso_FundingMetricsByProjectV1>>;
  oso_keyMetricsByArtifactV0?: Maybe<Array<Oso_KeyMetricsByArtifactV0>>;
  oso_keyMetricsByCollectionV0?: Maybe<Array<Oso_KeyMetricsByCollectionV0>>;
  oso_keyMetricsByProjectV0?: Maybe<Array<Oso_KeyMetricsByProjectV0>>;
  oso_metricsV0?: Maybe<Array<Oso_MetricsV0>>;
  oso_metricsV0ByMetricSourceMetricNamespaceMetricName?: Maybe<Oso_MetricsV0>;
  oso_modelsV0?: Maybe<Array<Oso_ModelsV0>>;
  oso_onchainMetricsByProjectV1?: Maybe<Array<Oso_OnchainMetricsByProjectV1>>;
  oso_packageOwnersV0?: Maybe<Array<Oso_PackageOwnersV0>>;
  oso_projectsByCollectionV1?: Maybe<Array<Oso_ProjectsByCollectionV1>>;
  oso_projectsV1?: Maybe<Array<Oso_ProjectsV1>>;
  oso_repositoriesV0?: Maybe<Array<Oso_RepositoriesV0>>;
  oso_sbomsV0?: Maybe<Array<Oso_SbomsV0>>;
  oso_timeseriesEventsByArtifactV0?: Maybe<Array<Oso_TimeseriesEventsByArtifactV0>>;
  oso_timeseriesMetricsByArtifactV0?: Maybe<Array<Oso_TimeseriesMetricsByArtifactV0>>;
  oso_timeseriesMetricsByArtifactV0ByMetricIdArtifactIdSampleDate?: Maybe<Oso_TimeseriesMetricsByArtifactV0>;
  oso_timeseriesMetricsByCollectionV0?: Maybe<Array<Oso_TimeseriesMetricsByCollectionV0>>;
  oso_timeseriesMetricsByCollectionV0ByMetricIdCollectionIdSampleDate?: Maybe<Oso_TimeseriesMetricsByCollectionV0>;
  oso_timeseriesMetricsByProjectV0?: Maybe<Array<Oso_TimeseriesMetricsByProjectV0>>;
  oso_timeseriesMetricsByProjectV0ByMetricIdProjectIdSampleDate?: Maybe<Oso_TimeseriesMetricsByProjectV0>;
  oso_usersV1?: Maybe<Array<Oso_UsersV1>>;
};


export type QueryOso_ArtifactsByCollectionV1Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_ArtifactsByCollectionV1OrderByExp>>;
  where?: InputMaybe<Oso_ArtifactsByCollectionV1BoolExp>;
};


export type QueryOso_ArtifactsByProjectV1Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_ArtifactsByProjectV1OrderBy>>;
  where?: InputMaybe<Oso_ArtifactsByProjectV1BoolExp>;
};


export type QueryOso_ArtifactsByUserV1Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_ArtifactsByUserV1OrderByExp>>;
  where?: InputMaybe<Oso_ArtifactsByUserV1BoolExp>;
};


export type QueryOso_ArtifactsV1Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_ArtifactsV1OrderByExp>>;
  where?: InputMaybe<Oso_ArtifactsV1BoolExp>;
};


export type QueryOso_CodeMetricsByArtifactV0Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_CodeMetricsByArtifactV0OrderBy>>;
  where?: InputMaybe<Oso_CodeMetricsByArtifactV0BoolExp>;
};


export type QueryOso_CodeMetricsByProjectV1Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_CodeMetricsByProjectV1OrderBy>>;
  where?: InputMaybe<Oso_CodeMetricsByProjectV1BoolExp>;
};


export type QueryOso_CollectionsV1Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_CollectionsV1OrderBy>>;
  where?: InputMaybe<Oso_CollectionsV1BoolExp>;
};


export type QueryOso_ContractsV0Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_ContractsV0OrderByExp>>;
  where?: InputMaybe<Oso_ContractsV0BoolExp>;
};


export type QueryOso_ContractsV0ByDeploymentDateArgs = {
  deploymentDate: Scalars['Oso_Date']['input'];
};


export type QueryOso_EventTypesV1Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_EventTypesV1OrderBy>>;
  where?: InputMaybe<Oso_EventTypesV1BoolExp>;
};


export type QueryOso_FundingMetricsByProjectV1Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_FundingMetricsByProjectV1OrderBy>>;
  where?: InputMaybe<Oso_FundingMetricsByProjectV1BoolExp>;
};


export type QueryOso_KeyMetricsByArtifactV0Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_KeyMetricsByArtifactV0OrderByExp>>;
  where?: InputMaybe<Oso_KeyMetricsByArtifactV0BoolExp>;
};


export type QueryOso_KeyMetricsByCollectionV0Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_KeyMetricsByCollectionV0OrderByExp>>;
  where?: InputMaybe<Oso_KeyMetricsByCollectionV0BoolExp>;
};


export type QueryOso_KeyMetricsByProjectV0Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_KeyMetricsByProjectV0OrderByExp>>;
  where?: InputMaybe<Oso_KeyMetricsByProjectV0BoolExp>;
};


export type QueryOso_MetricsV0Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_MetricsV0OrderBy>>;
  where?: InputMaybe<Oso_MetricsV0BoolExp>;
};


export type QueryOso_MetricsV0ByMetricSourceMetricNamespaceMetricNameArgs = {
  metricName: Scalars['String']['input'];
  metricNamespace: Scalars['String']['input'];
  metricSource: Scalars['String']['input'];
};


export type QueryOso_ModelsV0Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_ModelsV0OrderByExp>>;
  where?: InputMaybe<Oso_ModelsV0BoolExp>;
};


export type QueryOso_OnchainMetricsByProjectV1Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_OnchainMetricsByProjectV1OrderBy>>;
  where?: InputMaybe<Oso_OnchainMetricsByProjectV1BoolExp>;
};


export type QueryOso_PackageOwnersV0Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_PackageOwnersV0OrderByExp>>;
  where?: InputMaybe<Oso_PackageOwnersV0BoolExp>;
};


export type QueryOso_ProjectsByCollectionV1Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_ProjectsByCollectionV1OrderBy>>;
  where?: InputMaybe<Oso_ProjectsByCollectionV1BoolExp>;
};


export type QueryOso_ProjectsV1Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_ProjectsV1OrderBy>>;
  where?: InputMaybe<Oso_ProjectsV1BoolExp>;
};


export type QueryOso_RepositoriesV0Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_RepositoriesV0OrderByExp>>;
  where?: InputMaybe<Oso_RepositoriesV0BoolExp>;
};


export type QueryOso_SbomsV0Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_SbomsV0OrderByExp>>;
  where?: InputMaybe<Oso_SbomsV0BoolExp>;
};


export type QueryOso_TimeseriesEventsByArtifactV0Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_TimeseriesEventsByArtifactV0OrderBy>>;
  where?: InputMaybe<Oso_TimeseriesEventsByArtifactV0BoolExp>;
};


export type QueryOso_TimeseriesMetricsByArtifactV0Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_TimeseriesMetricsByArtifactV0OrderBy>>;
  where?: InputMaybe<Oso_TimeseriesMetricsByArtifactV0BoolExp>;
};


export type QueryOso_TimeseriesMetricsByArtifactV0ByMetricIdArtifactIdSampleDateArgs = {
  artifactId: Scalars['String']['input'];
  metricId: Scalars['String']['input'];
  sampleDate: Scalars['Oso_Date']['input'];
};


export type QueryOso_TimeseriesMetricsByCollectionV0Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_TimeseriesMetricsByCollectionV0OrderBy>>;
  where?: InputMaybe<Oso_TimeseriesMetricsByCollectionV0BoolExp>;
};


export type QueryOso_TimeseriesMetricsByCollectionV0ByMetricIdCollectionIdSampleDateArgs = {
  collectionId: Scalars['String']['input'];
  metricId: Scalars['String']['input'];
  sampleDate: Scalars['Oso_Date']['input'];
};


export type QueryOso_TimeseriesMetricsByProjectV0Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_TimeseriesMetricsByProjectV0OrderBy>>;
  where?: InputMaybe<Oso_TimeseriesMetricsByProjectV0BoolExp>;
};


export type QueryOso_TimeseriesMetricsByProjectV0ByMetricIdProjectIdSampleDateArgs = {
  metricId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
  sampleDate: Scalars['Oso_Date']['input'];
};


export type QueryOso_UsersV1Args = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Oso_UsersV1OrderBy>>;
  where?: InputMaybe<Oso_UsersV1BoolExp>;
};



export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {

  };
}
export type Sdk = ReturnType<typeof getSdk>;